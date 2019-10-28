import Coordinate from '../../BaseTool/Coordinate';
import Cesium from 'Cesium'
import PointDrawer from '../../BaseTool/Draw/DrawPoint';

/*
 * @Author: zhoujie
 * @Time: 2019-06-28 14:59
 * @FileName: Viewshed
 * @Description: 可视域
 */

export default class Viewshed {
    // viewer: any;
    // vishedfrustum: any = null;
    // pointEntities: any[] = [];

    constructor(viewer) {
        this.viewer = viewer;
        this.pointEntities = [];
    }

    init(pointArr) {
        if(pointArr.length === 1){
            this.pointEntities.push(PointDrawer.draw(this.viewer, pointArr[0], 10, Cesium.Color.AQUAMARINE))
        }
        else if(pointArr.length === 2){
            this.pointEntities.push(PointDrawer.draw(this.viewer, pointArr[0], 10, Cesium.Color.AQUAMARINE));
            this.pointEntities.push(PointDrawer.draw(this.viewer, pointArr[1], 10, Cesium.Color.AQUAMARINE));
            this.createViewshedMap(pointArr[0], pointArr[1]);
        }

    }

    exit() {
        //clear point arr
        this.pointEntities.forEach(item => {
            this.viewer.entities.remove(item);
        });
        this.pointEntities = [];
        //stop shadowMap
        // PopCity.viewer.scene.shadowMap.enabled = false;
        //clear primitive
        if (this.vishedfrustum) {
            this.viewer.scene.primitives.remove(this.vishedfrustum);
            this.vishedfrustum = false;
        }
        this.viewer.scene.primitives._primitives.forEach((item, index) => {
            if (item.name === 'VIEWSHEDPRIMITIVE') {
                this.viewer.scene.primitives._primitives.splice(index, 1);
            }
        });
    }

    createViewshedMap(start, end) {
        var scene = this.viewer.scene;
        var spotLightCamera = new Cesium.Camera(scene);
        spotLightCamera.position = start;
        spotLightCamera.direction = this.calculateDirection(start, end);
        spotLightCamera.up = Cesium.Cartesian3.clone(this.viewer.camera.up);
        spotLightCamera.frustum.fov = Cesium.Math.PI_OVER_THREE;
        spotLightCamera.frustum.near = 0.1;
        spotLightCamera.frustum.far = Cesium.Cartesian3.distance(start, end);

        //绘制视锥体
        this.drawFrustum(start, end, spotLightCamera.frustum);

        var viewshedOptions = {
            context: scene.context,
            lightCamera: spotLightCamera,
            cascadesEnabled: false,
            softShadows: true,
            viewshed: true
        };

        var viewshed = new Cesium.ShadowMap(viewshedOptions);
        viewshed.enabled = true;
        viewshed.size = 1024;

        // const ViewshedPrimitive = function(this, shadowMap) {
        //     this.shadowMap = shadowMap;
        //     this.name = 'VIEWSHEDPRIMITIVE';
        // }
        // var that = this;
        const ViewshedPrimitive = function(shadowMap) {
            this.shadowMap = shadowMap;
            this.name = 'VIEWSHEDPRIMITIVE';
        };

        ViewshedPrimitive.prototype.update = function(frameState) {
            frameState.shadowMaps.push(this.shadowMap);
        };

        scene.primitives.add(new ViewshedPrimitive(viewshed));
    }

    //计算方向
    calculateDirection(p1, p2) {
        return Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
        );
    }

    drawFrustum(position1, position2, frustum) {
        var orientation = this.calculateorigntation(position1, position2);

        var primitive = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.FrustumOutlineGeometry({
                    frustum: frustum,
                    origin: position1,
                    orientation: orientation
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 1.0))
                }
            }),
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true
            })
        });

        this.viewer.scene.primitives.add(primitive);

        this.vishedfrustum = primitive;
    }

    calculateorigntation(p1, p2) {
        var co1 = Coordinate.cartesian2lonlat(p1);
        var co2 = Coordinate.cartesian2lonlat(p2);

        var width = Coordinate.catchDistancefromCartographic2D(
            co1.longitude,
            co1.latitude,
            co2.longitude,
            co1.latitude
        );
        var length = Coordinate.catchDistancefromCartographic2D(
            co1.longitude,
            co1.latitude,
            co1.longitude,
            co2.latitude
        );
        var height = co1.height - co2.height;
        var distance = Coordinate.catchDistancefromCartographic2D(
            co1.longitude,
            co1.latitude,
            co2.longitude,
            co2.latitude
        );

        var angle = Math.atan(width / length);
        var tilt = Math.atan(height / distance);

        if (co1.latitude > co2.latitude) {
            angle = Math.PI - angle;
        }
        if (co1.longitude > co2.longitude) {
            angle = -angle;
        }

        var heading = angle;
        var pitch = 0;
        var roll = -Math.PI / 2 - tilt;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(p1, hpr);

        return orientation;
    }

    clearDraw() {
        //清除点
        if (this.pointEntities && this.pointEntities.length > 0) {
            for (var i = 0; i < this.pointEntities.length ; i++) {
                this.viewer.entities.remove(this.pointEntities[i]);
                // pointArr.splice(i,1);
            }
        }
        //清除视锥
        if (this.vishedfrustum) {
            this.viewer.scene.primitives.remove(this.vishedfrustum);
        }
        //清除阴影
        this.viewer.scene.primitives._primitives.forEach((item, index) => {
            if (item.name === 'VIEWSHEDPRIMITIVE') {
                this.viewer.scene.primitives._primitives.splice(index, 1);
            }
        });
    }
}
