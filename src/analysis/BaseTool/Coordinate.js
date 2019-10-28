/*
 * @Author: zhoujie
 * @Time: 2019-06-13 14:20
 * @FileName: Coordinate
 * @Description: 坐标辅助
 */
import Cesium from 'Cesium'

export default class CoordinateHelper {
    //笛卡尔转经纬高
    static cartesian2lonlat(cartesian, ellipsoid) {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian, ellipsoid);
        return {
            longitude: Cesium.Math.toDegrees(cartographic.longitude), //经度
            latitude: Cesium.Math.toDegrees(cartographic.latitude), //纬度
            height: cartographic.height //高度
        };
    }
    //经纬高转世界坐标
    static lonlat2cartesian(lon, lat, height) {
        return Cesium.Cartesian3.fromDegrees(lon, lat, height);
    }
    //世界坐标下提升高度
    static addHieght_cartesian(cartesian, height) {
        let tempCoord = this.cartesian2lonlat(cartesian);
        tempCoord.height += height;
        let car = this.lonlat2cartesian(tempCoord.longitude, tempCoord.latitude, tempCoord.height);
        return car;
    }
    //世界坐标下设置高度
    static setHieght_cartesian(cartesian, height) {
        let tempCoord = this.cartesian2lonlat(cartesian);
        tempCoord.height = height;
        let car = this.lonlat2cartesian(tempCoord.longitude, tempCoord.latitude, tempCoord.height);
        return car;
    }
    /**
     * 计算及经纬度之间的距离
     */
    static catchDistancefromCartographic2D(longitude1, latitude1, longitude2, latitude2) {
        let p1 = Cesium.Cartesian3.fromDegrees(longitude1, latitude1, 0);
        let p2 = Cesium.Cartesian3.fromDegrees(longitude2, latitude2, 0);
        let res = Cesium.Cartesian3.distance(p1, p2);
        return res;
    }
    //将传入的点设置为同一高度
    static decreaseHeight(cartesianArray) {
		let minHeight;
		let lonAndLatArray = cartesianArray.map((value) => {
				var coor = this.cartesian2lonlat(value);
				minHeight = !minHeight ? coor.height : minHeight > coor.height ? coor.height : minHeight;
				return coor;
			}
		);
		return lonAndLatArray.map(function(value){
			return Cesium.Cartesian3.fromDegrees(value.longitude,value.latitude,minHeight);
		});
    }
    //将传入的点顺时针排序  返回排序后的下标数组
    static clockwiseSort(array){
		let rightArray = [];
		let leftArray = [];
		let resArray = [];
		let centerPoint = {x:0,y:0};
		array.forEach(function (value) {
			centerPoint.x += value.x;
			centerPoint.y += value.y;
		});
		centerPoint.x = centerPoint.x / array.length;
		centerPoint.y = centerPoint.y / array.length;
		array.forEach(function (value,index) {
			if(value.x < centerPoint.x){
				leftArray.push({value:value,idx:index})
			}else{
				rightArray.push({value:value,idx:index})
			}
		});
		for(var i = 0; i < rightArray.length; i++){
			for(var j = i; j < rightArray.length; j++){
				if(rightArray[j].value.y < rightArray[i].value.y){
					var temp = {
						value : rightArray[j].value,
						idx : rightArray[j].idx
					};
					rightArray[j] = {
						value : rightArray[i].value,
						idx : rightArray[i].idx
					};
					rightArray[i] = temp
				}
			}
		}
		for(var m = 0; m < leftArray.length; m++){
			for(var n = m; n < leftArray.length; n++){
				if(leftArray[n].value.y > leftArray[m].value.y){
					var s_temp = {
						value : leftArray[n].value,
						idx : leftArray[n].idx
					};
					leftArray[n] = {
						value : leftArray[m].value,
						idx : leftArray[m].idx
					};
					leftArray[m] = s_temp;
				}
			}
		}
		rightArray.forEach(function (value) {
			resArray.push(value.idx);
		});
		leftArray.forEach(function (value) {
			resArray.push(value.idx)
		});
		return resArray;
	};
}
