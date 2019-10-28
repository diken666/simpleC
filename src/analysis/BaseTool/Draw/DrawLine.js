/*
 * @Author: zhoujie
 * @Time: 2019-06-13 14:01
 * @FileName: DrawPointWidget
 * @Description: 绘制各种类型的线
 */

import Cesium from 'Cesium'

export default class LineDrawer {
    static draw(viewer, positons, color, depthColor) {
        return viewer.entities.add({
            polyline: {
                positions: positons,
                width: 2,
                material: new Cesium.PolylineOutlineMaterialProperty({
                    color: color || Cesium.Color.GREEN,
                    outlineWidth: 1,
                    outlineColor: color || Cesium.Color.GREEN
                }),
                depthFailMaterial: depthColor
                    ? new Cesium.PolylineOutlineMaterialProperty({
                          color: depthColor,
                          outlineWidth: 0,
                          outlineColor: depthColor
                      })
                    : undefined
            }
        });
    }
}
