
// 添加点
document.getElementById('addPoint').addEventListener('click', ()=>{
    simpleC.removeAllEntities();
    simpleC.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    simpleC.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction((e)=>{
        let position = simpleC.viewer.scene.pickPosition(e.position);
        console.log(position)
        simpleC.addPoint(position)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
});

// 添加线
document.getElementById('addLine').addEventListener('click', ()=>{
    simpleC.removeAllEntities();
    simpleC.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    simpleC.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction((e)=>{
        simpleC.addPoint(e.position);
        simpleC.addLine(null, null, true)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
});

// 添加面
document.getElementById('addArea').addEventListener('click', ()=>{
    simpleC.removeAllEntities();
    simpleC.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    simpleC.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction((e)=>{
        simpleC.addPoint(e.position);
        console.log(simpleC.addArea());
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
});