import PointDrawer from '../../BaseTool/Draw/DrawPoint';
import LineDrawer from '../../BaseTool/Draw/DrawLine';
import Coordinate from '../../BaseTool/Coordinate';
/**
 * 通视分析
 */
import Cesium from 'Cesium'

export default class InterAnalysis {
    // viewer: any;
    // interAnalysis_map: Map<Symbol, any>;
    // lineEntities: any = [];
    // pointEntities: any[] = [];

    constructor(viewer) {
        this.viewer = viewer;
        this.interAnalysis_map = new Map();
        this.pointEntities = [];
        this.lineEntities = [];
    }

    create(sPoint, ePoint, objId) {
        if (ePoint.x === sPoint.x && ePoint.y === sPoint.y && ePoint.z === sPoint.z) {
            this.pointEntities.push(PointDrawer.draw(this.viewer, sPoint, 10, Cesium.Color.AQUAMARINE));
            console.warn('通视起点与终点重叠');
            return;
        }

        this.pointEntities.push(PointDrawer.draw(this.viewer, sPoint, 10, Cesium.Color.AQUAMARINE));
        this.pointEntities.push(PointDrawer.draw(this.viewer, ePoint, 10, Cesium.Color.AQUAMARINE));

        let obj = this.drawVisibility(sPoint, ePoint).then((obstaclePoint) => {
            //获取视觉障碍点, 绘制线段
            if (!obstaclePoint) {
                obstaclePoint = ePoint;
                return;
            }
            this.lineEntities.push(LineDrawer.draw(this.viewer, [sPoint, obstaclePoint], Cesium.Color.GREEN));
            this.lineEntities.push(LineDrawer.draw(this.viewer, [obstaclePoint, ePoint], Cesium.Color.RED));
        });

        this.interAnalysis_map.set(objId, obj);
    }

    //绘制通视线
    drawVisibility(sPoint, ePoint) {
        var promise = Cesium.when.defer();
        var removePreRenderListener = this.viewer.scene.postUpdate.addEventListener(() => {
            //设置相机
            var curCamera = this.setCameraPositoion(sPoint, ePoint);

            var removePostRenderListener = this.viewer.scene.postRender.addEventListener(() => {
                //取点
                var obstaclePoint = this.getObstaclePoint(ePoint);
                //重置相机
                this.resetCamera(curCamera);

                removePreRenderListener();

                var removeOverlayListener = this.viewer.scene.postRender.addEventListener(function() {
                    removeOverlayListener();
                });
                promise.resolve(obstaclePoint);
                removePostRenderListener();
            });
        });

        return promise;
    }

    //设置相机位置
    setCameraPositoion(sPoint, ePoint) {
        let curCamera = {
            positon: this.viewer.camera.position.clone(),
            direction: this.viewer.camera.direction.clone(),
            up: this.viewer.camera.up.clone()
        };
        let direction = this.calculateDirection(sPoint, ePoint);
        let location = Coordinate.cartesian2lonlat(sPoint);
        let position1 = Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, location.height + 0.1);
        this.viewer.camera.setView({
            destination: position1,
            orientation: {
                direction: direction,
                up: this.viewer.camera.up.clone()
            }
        });
        return curCamera;
    }

    //获取障碍点
    getObstaclePoint(ePoint) {
        let screenLocation = this.viewer.scene.cartesianToCanvasCoordinates(ePoint);

        if (!screenLocation) {
            console.warn('获取屏幕坐标失败');
            return ePoint;
        }
        let obstaclePoint = this.viewer.scene.pickPosition(screenLocation);
        return obstaclePoint;
    }

    //重置相机
    resetCamera(camera) {
        this.viewer.camera.setView({
            destination: camera.positon,
            orientation: {
                direction: camera.direction,
                up: camera.up
            }
        });
    }

    //计算方向
    calculateDirection(p1, p2) {
        return Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
        );
    }

    //清除绘制
    clearDraw() {
        if (this.pointEntities.length > 0) {
            for (let i = 0; i < this.pointEntities.length ; i++) {
                this.viewer.entities.removeById(this.pointEntities[i].id);
            }
        }
        if (this.lineEntities.length > 0) {
            for (let _i = 0; _i < this.lineEntities.length; _i++) {
                this.viewer.entities.removeById(this.lineEntities[_i].id);
            }
        }
    }
}
