import { useEffect, useCallback, useRef, useState } from 'react';
import { LoaderOverlay, Grid, NavigationCube, Viewer, ViewType, CameraType, InteractiveClippingPlane } from '@xbim/viewer';

const Xbimviewer = () => {
    const viewerRef = useRef(null);
    const viewerInstance = useRef(null); // Reference to the viewer instance
    const gridInstance = useRef(null); // Reference to the grid plugin instance
    const cubeInstance = useRef(null); // Reference to the cube plugin instance
    const clippingPlaneInstance = useRef(null); // 

    const [cubeStopped, setCubeStopped] = useState(false);
    const [gridStopped, setGridStopped] = useState(false);

    const [gamma, setGamma] = useState(1.0);
    const [contrast, setContrast] = useState(1.0);
    const [brightness, setBrightness] = useState(0.0);

    const initializeViewer = useCallback(() => {
        const viewer = new Viewer("xBIM-viewer");
        const viewer2 = new Viewer("viewer2");
        viewerInstance.current = viewer; // Store the viewer instance

        const overlay = new LoaderOverlay();
        viewer.addPlugin(overlay);
        overlay.show();

        viewer.cameraProperties.fov = 53;
        viewer.background = [0, 0, 0, 0];
        viewer.hoverPickEnabled = true;

        const plane = new InteractiveClippingPlane();
        clippingPlaneInstance.current = plane; // Store the clipping plane instance
        viewer.addPlugin(plane);

        const grid = new Grid();
        grid.zFactor = 20;
        grid.colour = [0, 0, 0, 0.8];
        gridInstance.current = grid; // Store the grid plugin instance
        viewer.addPlugin(grid);

        const cube = new NavigationCube();
        cube.ratio = 0.05;
        cube.passiveAlpha = cube.activeAlpha = 1.0;
        cube.minSize = 150;
        cubeInstance.current = cube; // Store the cube plugin instance
        viewer.addPlugin(cube);

        const sync = () => {
            viewer2.mvMatrix = viewer.mvMatrix;
            window.requestAnimationFrame(sync);
        };
        window.requestAnimationFrame(sync);
        viewer.load('/SampleHouse.wexbim');
        viewer2.loadAsync('/SampleHouse.wexbim');

        viewer.on('loaded', () => {
            viewer.start();
            viewer2.start();
            overlay.hide();
            viewer.show(ViewType.DEFAULT, undefined, undefined, false);
        });
    }, []);

    useEffect(() => {
        initializeViewer();
    }, [initializeViewer]);

    useEffect(() => {
        if (gridInstance.current) {
            gridInstance.current.stopped = gridStopped;
        }
    }, [gridStopped]);

    useEffect(() => {
        if (cubeInstance.current) {
            cubeInstance.current.stopped = cubeStopped;
        }
    }, [cubeStopped]);

    useEffect(() => {
        if (viewerInstance.current) {
            viewerInstance.current.gamma = parseFloat(gamma);
        }
    }, [gamma]);

    useEffect(() => {
        if (viewerInstance.current) {
            viewerInstance.current.contrast = parseFloat(contrast);
        }
    }, [contrast]);

    useEffect(() => {
        if (viewerInstance.current) {
            viewerInstance.current.brightness = parseFloat(brightness);
        }
    }, [brightness]);

    const setNavigationMode = (mode) => {
        if (viewerInstance.current) {
            viewerInstance.current.navigationMode = mode;
        }
    };

    const setViewType = (viewType) => {
        if (viewerInstance.current) {
            viewerInstance.current.show(viewType);
        }
    };

    const zoomToSelection = () => {
        if (viewerInstance.current) {
            viewerInstance.current.zoomToSelection();
        }
    };

    const clip = () => {
        if (clippingPlaneInstance.current) {
            clippingPlaneInstance.current.stopped = false;
        }
    };

    const hideClippingControl = () => {
        if (clippingPlaneInstance.current) {
            clippingPlaneInstance.current.stopped = true;
        }
    };

    const unclip = () => {
        if (viewerInstance.current) {
            viewerInstance.current.unclip();
        }
        if (clippingPlaneInstance.current) {
            clippingPlaneInstance.current.stopped = true;
        }
    };

    const clipBox = () => {
        if (viewerInstance.current) {
            const planes = [
                { direction: [1, 0, 0], location: [3000, 0, 0] },
                { direction: [0, 1, 0], location: [0, 2000, 0] },
                { direction: [0, 0, 1], location: [0, 0, 1000] },
                { direction: [-1, 0, 0], location: [-3000, 0, 0] },
                { direction: [0, -1, 0], location: [0, -2000, 0] },
                { direction: [0, 0, -1], location: [0, 0, -1000] }
            ];
            viewerInstance.current.sectionBox.setToPlanes(planes);
            viewerInstance.current.zoomTo();
        }
    };

    const releaseClipBox = () => {
        if (viewerInstance.current) {
            viewerInstance.current.sectionBox.clear();
            viewerInstance.current.zoomTo();
        }
    };

    const setCameraType = (cameraType) => {
        if (viewerInstance.current) {
            viewerInstance.current.camera = cameraType;
        }
    };

    const stopCube = () => setCubeStopped(true);
    const startCube = () => setCubeStopped(false);
    const stopGrid = () => setGridStopped(true);
    const startGrid = () => setGridStopped(false);

    const updateGamma = (event) => setGamma(event.target.value);
    const updateContrast = (event) => setContrast(event.target.value);
    const updateBrightness = (event) => setBrightness(event.target.value);

    return (
        <div className="ViewerWrapper" ref={viewerRef}>
            <canvas id="xBIM-viewer" width="1400" height="900"></canvas>
            <div style={{ position: "absolute", left: 0, bottom: 0, width: 400, height: 200 }}>
                <canvas id="viewer2" />
            </div>
            <div className="right-panel">
                <div>
                    <button onClick={() => setNavigationMode('orbit')}>Orbit</button>
                    <button onClick={() => setNavigationMode('free-orbit')}>Free orbit</button>
                    <button onClick={() => setNavigationMode('pan')}>Pan</button>
                    <button onClick={() => setNavigationMode('zoom')}>Zoom</button>
                    <button onClick={() => setNavigationMode('look-around')}>Look around</button>
                    <button onClick={() => setNavigationMode('walk')}>Walk</button>
                </div>
                <div>
                    <button onClick={() => setViewType(ViewType.DEFAULT)}>Default</button>
                    <button onClick={() => setViewType(ViewType.FRONT)}>Front</button>
                    <button onClick={() => setViewType(ViewType.BACK)}>Back</button>
                    <button onClick={() => setViewType(ViewType.TOP)}>Top</button>
                    <button onClick={() => setViewType(ViewType.BOTTOM)}>Bottom</button>
                    <button onClick={() => setViewType(ViewType.LEFT)}>Left</button>
                    <button onClick={() => setViewType(ViewType.RIGHT)}>Right</button>
                    <button onClick={zoomToSelection}>Zoom to selection</button>
                </div>
                <div>
                    <button onClick={clip}>Clip model</button>
                    <button onClick={hideClippingControl}>Hide control</button>
                    <button onClick={unclip}>Reset clipping</button>
                    <button onClick={clipBox}>Clip model with box</button>
                    <button onClick={releaseClipBox}>Release clip box</button>
                </div>
                <div>
                    <button onClick={() => setCameraType(CameraType.PERSPECTIVE)}>Perspective</button>
                    <button onClick={() => setCameraType(CameraType.ORTHOGONAL)}>Orthographic</button>
                </div>


                <div>
                    Grid and navigation cube
                    <br />
                    <button onClick={stopCube}>Stop cube</button>
                    <button onClick={startCube}>Start cube</button>
                    <button onClick={stopGrid}>Stop grid</button>
                    <button onClick={startGrid}>Start grid</button>
                </div>
                <div>
                    Gamma:
                        <input type="range" name="gamma" min="0" max="5" step="0.1" value={gamma} onChange={updateGamma}
                    />
                    Contrast:
                        <input type="range" name="contrast" min="0" max="5" step="0.1" value={contrast} onChange={updateContrast}
                    />
                    Brightness:
                        <input type="range" name="brightness" min="-1" max="1" step="0.1" value={brightness} onChange={updateBrightness}
                    />
                </div>
            </div>
        </div>
    );
};

export default Xbimviewer
