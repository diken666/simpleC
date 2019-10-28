
class SimpleC {

    constructor(viewer) {
        this.viewer = viewer;
        this.pointArr = [];
    }

    // 添加点
    addPoint(position, color, pixelSize, outlineColor, outlineWidth) {
        // 判断是否是世界坐标
        let pos = position;
        if ( !pos.z ) {
            pos = this.viewer.scene.camera.pickEllipsoid(pos, simpleC.viewer.scene.globe.ellipsoid);
        }

        // 将该点加入点的数组
        this.pointArr.push(pos);

        pixelSize = pixelSize || 8;
        color = color || Cesium.Color.DODGERBLUE;
        outlineColor = outlineColor || Cesium.Color.WHITE;
        outlineWidth = outlineWidth || 2;
        return this.viewer.entities.add({
            position : pos,
            point : {
                pixelSize,
                color,
                outlineColor,
                outlineWidth
            }
        });
    }

    // 添加线
    addLine(color, width, showDistance) {

        if ( this.pointArr.length >= 2 ) {
            let length = Math.ceil(this.getDistance(this.pointArr.slice(-2)));
            let lastPosition = this.pointArr[this.pointArr.length-2];
            let nowPosition = this.pointArr[this.pointArr.length-1];
            width = width || 2;
            color = color || Cesium.Color.DODGERBLUE;
            let line = this.viewer.entities.add({
                name: 'line',
                polyline: {
                    positions: [lastPosition, nowPosition],
                    width,
                    material: color ,
                }
            });
            // 为线段添加长度属性
            line.lineLength = length;

            let label = null;
            if ( showDistance ) {
                let centerPosition = {
                    x: lastPosition.x + (nowPosition.x - lastPosition.x) / 2,
                    y: lastPosition.y + (nowPosition.y - lastPosition.y) / 2,
                    z: lastPosition.z + (nowPosition.z - lastPosition.z) / 2,
                };
                label = this.viewer.entities.add({
                    position: centerPosition,
                    label: {
                        text : `${length}米`,
                        font : '14pt monospace',
                        showBackground: true,
                        backgroundColor: Cesium.Color.BLACK.withAlpha(.5),
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth : 2,
                        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset : new Cesium.Cartesian2(0, -9),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                })
            }

            return [line, label];

        } else {

            return [null, null];

        }
    }

    // 画面 ( 颜色 )
    addArea( color ){
        let pointArr = this.pointArr;
        if ( pointArr.length >= 3 ) {
            let tempArr = [];
            let tempPositions = pointArr.slice(-2);
            tempPositions.push(pointArr[0]);
            for(let i=0; i<tempPositions.length; i++){
                let point = this.worldPosToLngAndLat(tempPositions[i]);
                tempArr.push(point.lng);
                tempArr.push(point.lat);
                tempArr.push(point.height);
            }

            color = color || Cesium.Color.DODGERBLUE.withAlpha(.6);
            let area = this.getArea(tempPositions);
            let entity =  this.viewer.entities.add({
                name : 'polygon',
                polygon : {
                    hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights([...tempArr]),
                    material : color,
                    perPositionHeight : true
                }
            });
            entity.area = area;
            return entity
        }
    }

    // 移除所有实体
    removeAllEntities() {
        this.viewer.entities.removeAll()
    }

    // 获得总的线段距离 (世界坐标数组)
    getDistance(positions){
        let distance = 0;
        let geodesic = new Cesium.EllipsoidGeodesic();
        for(let i=0; i<positions.length-1; i++){
            let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
            let point2cartographic = Cesium.Cartographic.fromCartesian(positions[i+1]);
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            let s = geodesic.surfaceDistance;
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            distance = distance + s;
        }
        return distance
    }

    // 计算多边形面积
    // 参数{ 经纬度， 世界坐标 }
    getArea(positionArr) {
        let res = 0;
        //拆分三角曲面
        if(positionArr.length >=3){
            for(let i=2; i<positionArr.length; i++){
                let angle = this.Angle(positionArr[0], positionArr[i-1], positionArr[i]);
                res += this.getTriangleArea(angle, [positionArr[0], positionArr[i-1], positionArr[i]]);
            }
        }
        return res;
    }

    // 计算三角形的面积
    getTriangleArea(angle, pointArr){
        let dis_temp1 = this.getDistance([pointArr[0], pointArr[1]]);
        let dis_temp2 = this.getDistance([pointArr[1], pointArr[2]]);
        return dis_temp1 * dis_temp2 * Math.abs(Math.sin(angle * Math.PI / 180)) / 2;
    }

    // 获得线p2p1与p2p3的夹角（数值为角度值，如果要转化为弧度 还需要 * Math.PI / 180）
    Angle(p1, p2, p3) {
        let bearing21 = this.Bearing(p2, p1);
        let bearing23 = this.Bearing(p2, p3);
        let angle = bearing21 - bearing23;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }

    Bearing(from, to) {
        const radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
        const degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度
        let point1 = this.worldPosToLngAndLat(from);
        let point2 = this.worldPosToLngAndLat(to);
        let lat1 = point1.lat * radiansPerDegree;
        let lng1 = point1.lng * radiansPerDegree;
        let lat2 = point2.lat * radiansPerDegree;
        let lng2 = point2.lng * radiansPerDegree;
        let angle = -Math.atan2(Math.sin(lng1 - lng2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng1 - lng2));
        if (angle < 0) {
            angle += Math.PI * 2.0;
        }
        angle = angle * degreesPerRadian;//角度
        return angle;
    }

    // 世界坐标转化为经纬度
    worldPosToLngAndLat(position) {
        let ellipsoid = this.viewer.scene.globe.ellipsoid;
        let cartesian3 = new Cesium.Cartesian3(position.x, position.y, position.z);
        let cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let lng = Cesium.Math.toDegrees(cartographic.longitude);
        let height = cartographic.height;
        return { lng, lat, height }
    }
}