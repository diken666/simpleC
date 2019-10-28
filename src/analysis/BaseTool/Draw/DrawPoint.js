/*
 * @Author: zhoujie
 * @Time: 2019-06-13 14:01
 * @FileName: DrawPointWidget
 * @Description: 绘制各种类型的点
 */

// import * as _ from 'lodash';
import Cesium from 'Cesium'

export default class DrawPoint {
    static draw(viewer, position, size, color, id) {
        if (position instanceof Array) {
            position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2] ? position[2] : 0);
        }
        let options = {
            position: position,
            point: {
                pixelSize: size,
                color: color
            }
        };
        if (id) {
            options = _.merge(options, {
                id: id
            });
        }
        return viewer.entities.add(options);
    }
}
