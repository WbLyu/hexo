---
title: fast-lio2调试笔记
date: 2025-07-26 23:29:40
# updated:
# tags:
#     - 
categories: 笔记
# keywords:
# description:
top_img: transparent
# comments:
# toc:
# toc_number:
# toc_style_simple:
# copyright:
# copyright_author:
# copyright_author_href:
# copyright_url:
# copyright_info:
# mathjax:
# katex:
# aplayer:
# highlight_shrink:
# aside:
# abcjs:
# noticeOutdate:
cover: https://img.wblyu.top/images/ab6349b9e62e5994f29163acccd70c33.avif
---

## 1. 为点云保存到地图中增加触发条件

### 1.1 添加控制参数

```cpp
// 在现有全局变量区域添加
bool start_save_pcd = false;           // 控制是否开始保存点云
```

### 1.2 修改`publish_frame_world`函数

将现有的`publish_frame_world`函数替换为以下版本：

```cpp
void publish_frame_world(const ros::Publisher & pubLaserCloudFull)
{
    if(scan_pub_en)
    {
        PointCloudXYZI::Ptr laserCloudFullRes(dense_pub_en ? feats_undistort : feats_down_body);
        int size = laserCloudFullRes->points.size();
        PointCloudXYZI::Ptr laserCloudWorld( \
                        new PointCloudXYZI(size, 1));

        for (int i = 0; i < size; i++)
        {
            RGBpointBodyToWorld(&laserCloudFullRes->points[i], \
                                &laserCloudWorld->points[i]);
        }

        sensor_msgs::PointCloud2 laserCloudmsg;
        pcl::toROSMsg(*laserCloudWorld, laserCloudmsg);
        laserCloudmsg.header.stamp = ros::Time().fromSec(lidar_end_time);
        laserCloudmsg.header.frame_id = "camera_init";
        pubLaserCloudFull.publish(laserCloudmsg);
        publish_count -= PUBFRAME_PERIOD;
    }

    /**************** save map ****************/
    /* 1. make sure you have enough memories
    /* 2. noted that pcd save will influence the real-time performences **/
    if (pcd_save_en)
    {
        // 检查是否应该开始保存点云
        if (!start_save_pcd) {
            if (达到触发条件) {
                start_save_pcd = true;
            }
        }
        
        // 只有在开始保存后才处理点云数据
        if (start_save_pcd) {
            int size = feats_undistort->points.size();
            PointCloudXYZI::Ptr laserCloudWorld( \
                            new PointCloudXYZI(size, 1));

            for (int i = 0; i < size; i++)
            {
                RGBpointBodyToWorld(&feats_undistort->points[i], \
                                    &laserCloudWorld->points[i]);
            }
            *pcl_wait_save += *laserCloudWorld;

            static int scan_wait_num = 0;
            scan_wait_num ++;
            if (pcl_wait_save->size() > 0 && pcd_save_interval > 0  && scan_wait_num >= pcd_save_interval)
            {
                pcd_index ++;
                string all_points_dir(string(string(ROOT_DIR) + "PCD/scans_") + to_string(pcd_index) + string(".pcd"));
                pcl::PCDWriter pcd_writer;
                cout << "current scan saved to /PCD/" << all_points_dir << endl;
                pcd_writer.writeBinary(all_points_dir, *pcl_wait_save);
                pcl_wait_save->clear();
                scan_wait_num = 0;
            }
        }
    }
}
```
