/**
 * SmartTrack — 3D Faculty Locator
 * Uses 3dmodel.glb model, room popups on click, faculty status highlights.
 */

// ═══════════════════════════════════════════════════
// ROOM LABEL MAP — Maps GLB mesh names → Room info
// The current GLB labels rooms with numeric node names; the loader registers them as room_<number>.
// This map supplies display details where a model node has a matching entry.
// ═══════════════════════════════════════════════════
const ROOM_LABEL_MAP = {
  // Ground Floor rooms (room_001..room_015 → 101..115)
  'room_001': { label: 'Room 101 — CSE Lecture', floor: 'Ground Floor', type: 'classroom', collegeRoom: '101' },
  'room_002': { label: 'Room 102 — ECE Lecture', floor: 'Ground Floor', type: 'classroom', collegeRoom: '102' },
  'room_003': { label: 'Room 103 — Principal Cabin', floor: 'Ground Floor', type: 'cabin', collegeRoom: '103' },
  'room_004': { label: 'Reception / Admin', floor: 'Ground Floor', type: 'office', collegeRoom: 'reception' },
  'room_005': { label: 'Library', floor: 'Ground Floor', type: 'library', collegeRoom: 'LIBRARY' },
  'room_006': { label: 'Canteen', floor: 'Ground Floor', type: 'canteen', collegeRoom: 'CANTEEN' },
  'room_007': { label: 'Staff Room', floor: 'Ground Floor', type: 'office', collegeRoom: '201' },
  'room_008': { label: 'HOD CSE Cabin', floor: 'Ground Floor', type: 'cabin', collegeRoom: 'HOD-CSE' },
  'room_009': { label: 'Conference Room', floor: 'Ground Floor', type: 'hall', collegeRoom: 'CONF' },
  'room_010': { label: 'Seminar Hall', floor: 'Ground Floor', type: 'hall', collegeRoom: 'Seminar Hall' },
  // 1st Floor rooms
  'room_011': { label: 'Room 201 — Staff Room', floor: '1st Floor', type: 'classroom', collegeRoom: '201' },
  'room_012': { label: 'Room 202 — ECE Lab', floor: '1st Floor', type: 'lab', collegeRoom: '202' },
  'room_013': { label: 'Room 203', floor: '1st Floor', type: 'classroom', collegeRoom: '203' },
  'room_014': { label: 'CS Lab 1', floor: '1st Floor', type: 'lab', collegeRoom: 'Lab-CS1' },
  'room_015': { label: 'CS Lab 2', floor: '1st Floor', type: 'lab', collegeRoom: 'Lab-CS2' },
  'room_016': { label: 'AI / ML Lab', floor: '1st Floor', type: 'lab', collegeRoom: 'Lab-AI' },
  'room_017': { label: 'ECE Lab 1', floor: '1st Floor', type: 'lab', collegeRoom: 'Lab-ECE1' },
  'room_018': { label: 'ECE Lab 2', floor: '1st Floor', type: 'lab', collegeRoom: 'Lab-ECE2' },
  'room_019': { label: 'Cabin C-201', floor: '1st Floor', type: 'cabin', collegeRoom: 'C-201' },
  'room_022': { label: 'Cabin C-202', floor: '1st Floor', type: 'cabin', collegeRoom: 'C-202' },
  'room_023': { label: 'Cabin C-205', floor: '1st Floor', type: 'cabin', collegeRoom: 'C-205' },
  'room_024': { label: 'Cabin C-206', floor: '1st Floor', type: 'cabin', collegeRoom: 'C-206' },
  // 2nd Floor rooms
  'room_025': { label: 'Room 301 — ME Lecture', floor: '2nd Floor', type: 'classroom', collegeRoom: '301' },
  'room_026': { label: 'Room 302', floor: '2nd Floor', type: 'classroom', collegeRoom: '302' },
  'room_027': { label: 'ME Lab 1', floor: '2nd Floor', type: 'lab', collegeRoom: 'Lab-ME1' },
  'room_028': { label: 'ME Lab 2', floor: '2nd Floor', type: 'lab', collegeRoom: 'Lab-ME2' },
  'room_029': { label: 'Cabin C-301', floor: '2nd Floor', type: 'cabin', collegeRoom: 'C-301' },
  'room_030': { label: 'DSP Lab', floor: '2nd Floor', type: 'lab', collegeRoom: 'Lab-ECE3' },
  // 3rd Floor rooms
  'room_031': { label: 'Room 401 — Mathematics', floor: '3rd Floor', type: 'classroom', collegeRoom: '401' },
  'room_032': { label: 'Cabin C-401', floor: '3rd Floor', type: 'cabin', collegeRoom: 'C-401' },
  'room_033': { label: 'Room 402', floor: '3rd Floor', type: 'classroom', collegeRoom: '402' },
  'room_034': { label: 'Room 501 — Civil Engg', floor: '4th Floor', type: 'classroom', collegeRoom: '501' },
  'room_035': { label: 'Cabin C-501', floor: '4th Floor', type: 'cabin', collegeRoom: 'C-501' },
  'room_036': { label: 'CE Lab 1', floor: '4th Floor', type: 'lab', collegeRoom: 'Lab-CE1' },
  'room_037': { label: 'CE Lab 2', floor: '4th Floor', type: 'lab', collegeRoom: 'Lab-CE2' },
  // Extra rooms
  'room_038': { label: 'Microwave Lab', floor: '2nd Floor', type: 'lab', collegeRoom: 'Lab-ECE4' },
  'room_039': { label: 'ML Lab', floor: '1st Floor', type: 'lab', collegeRoom: 'Lab-ML' },
  'room_040': { label: 'Project Room A', floor: '1st Floor', type: 'office', collegeRoom: 'Proj-A' },
  'room_041': { label: 'Project Room B', floor: '2nd Floor', type: 'office', collegeRoom: 'Proj-B' },
  'room_042': { label: 'Store Room', floor: 'Ground Floor', type: 'office', collegeRoom: 'STORE' },
  'room_043': { label: 'Washroom / Utilities', floor: 'Ground Floor', type: 'office', collegeRoom: 'UTIL' },
  'room_044': { label: 'Open Lobby', floor: 'Ground Floor', type: 'hall', collegeRoom: 'LOBBY' },
  'room_045': { label: 'Guard Room', floor: 'Ground Floor', type: 'office', collegeRoom: 'GUARD' },
  // Wing rooms
  'room_111': { label: 'Wing A — Room 111', floor: '1st Floor', type: 'classroom', collegeRoom: '111' },
  'room_112': { label: 'Wing A — Room 112', floor: '1st Floor', type: 'classroom', collegeRoom: '112' },
  'room_121': { label: 'Wing B — Room 121', floor: '1st Floor', type: 'classroom', collegeRoom: '121' },
  'room_122': { label: 'Wing B — Room 122', floor: '1st Floor', type: 'classroom', collegeRoom: '122' },
  'room_1002': { label: 'Annex Room 1002', floor: '2nd Floor', type: 'classroom', collegeRoom: '1002' },
  'room_1003': { label: 'Annex Room 1003', floor: '2nd Floor', type: 'classroom', collegeRoom: '1003' },
};

// Reverse lookup: college room number → GLB room key
const COLLEGE_TO_GLB = {};
function normalizeRoomKey(str) {
  if (!str) return '';
  return String(str).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

Object.entries(ROOM_LABEL_MAP).forEach(([key, val]) => {
  if (val.collegeRoom) {
    const norm = normalizeRoomKey(val.collegeRoom);
    if (norm) COLLEGE_TO_GLB[norm] = key;
    COLLEGE_TO_GLB[val.collegeRoom.toUpperCase()] = key;
  }
});

// ═══════════════════════════════════════════════════
// ═══════════════════════════════════════════════════
// SCENE SETUP (Daylight Architectural Environment from 3D View)
// ═══════════════════════════════════════════════════
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1f5f9); // Bright Slate-100 base

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.5, 1200);
camera.position.set(45, 52, 85);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 18;             // Prevents clipping into walls
controls.maxDistance = 165;            // Prevents zooming out too far into void
controls.minPolarAngle = Math.PI / 18; // ~10 deg: prevents flipping over zenith
controls.maxPolarAngle = Math.PI / 2.15;// ~83.7 deg: strictly locks camera above ground level
controls.rotateSpeed = 0.85;
controls.zoomSpeed = 1.0;
controls.panSpeed = 0.85;
controls.target.set(0, 6, 0);

const TARGET_BOUNDS = { minX: -80, maxX: 80, minY: 0.4, maxY: 18, minZ: -50, maxZ: 36 };
let DEFAULT_CAM = { x: 45, y: 52, z: 85, tx: 0, ty: 6, tz: 0 };
let activeBeacon = null;

// ═══════════════════════════════════════════════════
// LIGHTING (Bright Architectural Daylight from 3D View)
// ═══════════════════════════════════════════════════
const ambientLight = new THREE.AmbientLight(0xffffff, 1.85);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 1.35);
scene.add(hemiLight);

const sun = new THREE.DirectionalLight(0xfffef7, 2.2);
sun.position.set(60, 95, 65);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 10;
sun.shadow.camera.far = 400;
sun.shadow.camera.left = -160;
sun.shadow.camera.right = 160;
sun.shadow.camera.top = 160;
sun.shadow.camera.bottom = -160;
sun.shadow.bias = -0.0003;
scene.add(sun);

const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.95);
fillLight.position.set(-60, 45, -45);
scene.add(fillLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 1.15);
frontLight.position.set(25, 65, 100);
scene.add(frontLight);

// ═══════════════════════════════════════════════════
// ARCHITECTURAL GROUND & ENVIRONMENT (from 3D View)
// ═══════════════════════════════════════════════════
function createCampusGroundGroup() {
    const group = new THREE.Group();
    group.name = 'Campus_Ground_Environment';

    // 1. Base Ground Plane
    const groundGeo = new THREE.PlaneGeometry(360 * 1.5, 360 * 1.5);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.95,
        metalness: 0.0
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.02;
    groundMesh.receiveShadow = true;
    group.add(groundMesh);

    // 2. Central Plaza Plot
    const plotGeo = new THREE.PlaneGeometry(280, 150);
    const plotMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.9,
        metalness: 0.02
    });
    const plotMesh = new THREE.Mesh(plotGeo, plotMat);
    plotMesh.rotation.x = -Math.PI / 2;
    plotMesh.position.set(0, -0.01, -5);
    plotMesh.receiveShadow = true;
    group.add(plotMesh);

    // 3. Tactile Precision Grid
    const gridHelper = new THREE.GridHelper(360, 72, 0x94a3b8, 0xcbd5e1);
    gridHelper.position.y = 0.01;
    if (gridHelper.material) {
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.4;
    }
    group.add(gridHelper);

    // 4. Subtle Outer Perimeter Ring
    const ringGeo = new THREE.RingGeometry(140, 140.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
    });
    const boundaryRing = new THREE.Mesh(ringGeo, ringMat);
    boundaryRing.rotation.x = -Math.PI / 2;
    boundaryRing.position.y = 0.02;
    group.add(boundaryRing);

    // 5. Front Entrance Approach Road
    const roadGeo = new THREE.PlaneGeometry(22, 65);
    const roadMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.85
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(13.6, 0.01, 55);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // 6. Walkway Center Stripe
    const lineGeo = new THREE.PlaneGeometry(1.2, 55);
    const lineMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85
    });
    const lineMesh = new THREE.Mesh(lineGeo, lineMat);
    lineMesh.rotation.x = -Math.PI / 2;
    lineMesh.position.set(13.6, 0.015, 55);
    group.add(lineMesh);

    return group;
}

const groundGroup = createCampusGroundGroup();
scene.add(groundGroup);

// ═══════════════════════════════════════════════════
// DESTINATION BEACON (Compact Pointing Pin from 3D View)
// ═══════════════════════════════════════════════════
function createDestinationBeacon(position) {
    const beacon = new THREE.Group();
    beacon.name = 'Destination_Beacon';
    beacon.position.copy(position);

    // Glowing Pin Head
    const pinGeo = new THREE.SphereGeometry(0.28, 24, 24);
    const pinMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
        roughness: 0.2
    });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.y = 1.0;
    beacon.add(pin);

    // Needle pointing down
    const needleGeo = new THREE.ConeGeometry(0.14, 0.7, 16);
    const needleMat = new THREE.MeshStandardMaterial({
        color: 0x059669,
        roughness: 0.3
    });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.rotation.x = Math.PI;
    needle.position.y = 0.55;
    beacon.add(needle);

    // Ground Ring
    const ringGeo = new THREE.RingGeometry(0.25, 0.45, 32);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    beacon.add(ring);

    return beacon;
}

// ═══════════════════════════════════════════════════
// ROOM MESH REGISTRY
// ═══════════════════════════════════════════════════
const roomMeshes = {};   // roomKey → { meshes: [], highlighted, blinking, sprite, labelInfo }
const allMeshes  = [];
let   glbLoaded  = false;
let   loadedModel = null;

// ═══════════════════════════════════════════════════
// LOAD 3D CAMPUS MODEL (from 3D View)
// ═══════════════════════════════════════════════════
const loader = new THREE.GLTFLoader();
const loadBar = document.getElementById('load-bar');

function updateLoadBar(pct) { if (loadBar) loadBar.style.width = pct + '%'; }

loader.load(
    '/static/3d_models/campus.glb?v=4',
    (gltf) => {
        loadedModel = gltf.scene;

        loadedModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                allMeshes.push(node);

                // Preserve original architectural materials and harmonize roughness/debug colors
                if (node.material) {
                    const applyMat = (mat) => {
                        if (mat.roughness !== undefined) {
                            mat.roughness = 0.45;
                            mat.metalness = 0.04;
                        }
                        if (mat.color) {
                            const { r, g, b } = mat.color;
                            if (r > 0.35 && g < 0.15 && b > 0.35) {
                                mat.color.setRGB(0.00182, 0.53948, 0.7991);
                            }
                        }
                    };
                    if (Array.isArray(node.material)) {
                        node.material.forEach(applyMat);
                    } else {
                        applyMat(node.material);
                    }
                }
                node.userData.originalMaterial = Array.isArray(node.material) 
                    ? node.material.map(m => m.clone()) 
                    : node.material.clone();

                // ═══════════════════════════════════════════════════
                // ROOM DETECTION LOGIC
                // ═══════════════════════════════════════════════════
                const rawNodeName = node.name || '';
                const rawParentName = node.parent?.name || '';
                
                const cleanNodeName = rawNodeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const cleanParentName = rawParentName.toLowerCase().replace(/[^a-z0-9]/g, '_');

                let matchedKey = null;
                let collegeRoom = null;

                // 1. STRATEGY A: Explicit Number Detection (Priority)
                let numMatch = rawNodeName.match(/(\d{2,})/);
                if (!numMatch) numMatch = rawParentName.match(/(\d{2,})/);
                
                if (numMatch) {
                    collegeRoom = numMatch[1];
                    matchedKey = 'room_' + collegeRoom;
                } 
                // 2. STRATEGY B: Check Hardcoded ROOM_LABEL_MAP
                else {
                    for (const [key, val] of Object.entries(ROOM_LABEL_MAP)) {
                        const cRoom = val.collegeRoom ? val.collegeRoom.toLowerCase() : '';
                        if (key === cleanNodeName || key === cleanParentName || 
                            (cRoom && (cleanNodeName.includes(cRoom) || cleanParentName.includes(cRoom)))) {
                            matchedKey = key;
                            collegeRoom = val.collegeRoom;
                            break;
                        }
                    }
                }

                // 3. STRATEGY C: Fallback to Raw Name
                if (!matchedKey && rawNodeName.length > 2) {
                    matchedKey = 'room_' + cleanNodeName;
                    collegeRoom = rawNodeName;
                }

                if (matchedKey) {
                    if (!roomMeshes[matchedKey]) {
                        if (!ROOM_LABEL_MAP[matchedKey]) {
                            ROOM_LABEL_MAP[matchedKey] = {
                                label: 'Room ' + (collegeRoom || matchedKey.replace('room_', '')),
                                floor: 'Unknown Floor',
                                type: 'classroom',
                                collegeRoom: collegeRoom || matchedKey.replace('room_', '')
                            };
                        }
                        
                        roomMeshes[matchedKey] = {
                            meshes: [], highlighted: false, blinking: false,
                            sprite: null, labelInfo: ROOM_LABEL_MAP[matchedKey]
                        };

                        const finalCRoom = ROOM_LABEL_MAP[matchedKey].collegeRoom;
                        if (finalCRoom) {
                            COLLEGE_TO_GLB[normalizeRoomKey(finalCRoom)] = matchedKey;
                            COLLEGE_TO_GLB[finalCRoom.toUpperCase()] = matchedKey;
                        }
                    }
                    
                    roomMeshes[matchedKey].meshes.push(node);
                    node.userData.roomKey = matchedKey;
                }
            }
        });

        // Auto-center model horizontally and seat at y = 0 (matching 3D View)
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        loadedModel.position.x = -center.x;
        loadedModel.position.y = -box.min.y;
        loadedModel.position.z = -center.z;
        loadedModel.scale.set(1, 1, 1);
        loadedModel.rotation.set(0, 0, 0);
        loadedModel.updateMatrixWorld(true);
        scene.add(loadedModel);

        // Camera framing from 3D View
        camera.position.set(45, 52, 85);
        controls.target.set(0, 6, 0);
        controls.update();
        DEFAULT_CAM = { x: 45, y: 52, z: 85, tx: 0, ty: 6, tz: 0 };

        glbLoaded = true;
        updateLoadBar(100);

        const detected = Object.keys(roomMeshes).length;
        document.getElementById('tb-mode').textContent =
            `Campus Model Loaded — ${detected} rooms detected`;
        console.log('Rooms mapped:', Object.keys(roomMeshes));

        setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.style.display = 'none', 800);
            }
        }, 400);

        loadFacultyData();
    },
    (progress) => {
        if (progress.total > 0) updateLoadBar(Math.round(progress.loaded / progress.total * 90));
    },
    (error) => {
        console.warn('campus.glb failed, using procedural fallback:', error);
        buildProceduralFallback();
        setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.style.display = 'none', 800);
            }
        }, 600);
        loadFacultyData();
    }
);

// ═══════════════════════════════════════════════════
// PROCEDURAL FALLBACK (if GLB fails)
// ═══════════════════════════════════════════════════
const FALLBACK_ROOMS = [
    { key:'room_101', label:'Room 101 — CSE',       x:-35, z:-18, floor:0, type:'classroom' },
    { key:'room_102', label:'Room 102 — ECE',        x:0,   z:-18, floor:0, type:'classroom' },
    { key:'room_103', label:'Room 103 — ME',         x:35,  z:-18, floor:0, type:'classroom' },
    { key:'hod_cse',  label:'HOD CSE Cabin',         x:-35, z:14,  floor:0, type:'cabin'     },
    { key:'library',  label:'Library',               x:0,   z:14,  floor:0, type:'library'   },
    { key:'canteen',  label:'Canteen',               x:35,  z:14,  floor:0, type:'canteen'   },
    { key:'room_201', label:'Room 201 — Staff Room', x:-35, z:-18, floor:1, type:'classroom' },
    { key:'room_202', label:'Room 202',              x:0,   z:-18, floor:1, type:'classroom' },
    { key:'lab_cs1',  label:'CS Lab 1',              x:35,  z:-18, floor:1, type:'lab'       },
    { key:'room_301', label:'Room 301',              x:-35, z:-18, floor:2, type:'classroom' },
    { key:'room_401', label:'Room 401 — Maths',      x:0,   z:-18, floor:2, type:'classroom' },
    { key:'room_501', label:'Room 501',              x:35,  z:-18, floor:2, type:'classroom' },
];

const ROOM_COLORS = { classroom:0x16213e, lab:0x0f2d52, cabin:0x1a1a3e, library:0x0d2b1f, canteen:0x2d1a0d, hall:0x1a0d2e };

function buildProceduralFallback() {
    const FLOOR_H = 10, ROOM_W = 20, ROOM_H = 7.5, ROOM_D = 20;

    for (let fi = 0; fi < 3; fi++) {
        const slab = new THREE.Mesh(
            new THREE.BoxGeometry(115, 0.5, 58),
            new THREE.MeshStandardMaterial({ color: 0x0f3460, roughness: 0.85 })
        );
        slab.position.set(0, fi * FLOOR_H - 0.25, -2);
        slab.receiveShadow = true;
        scene.add(slab);
    }

    FALLBACK_ROOMS.forEach(room => {
        const y   = room.floor * FLOOR_H;
        const col = ROOM_COLORS[room.type] || 0x16213e;
        const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.7, metalness: 0.05 });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W - 1, ROOM_H, ROOM_D - 1), mat);
        mesh.position.set(room.x, y + ROOM_H / 2, room.z);
        mesh.castShadow = true; mesh.receiveShadow = true;
        mesh.name = room.key;
        mesh.userData.originalMaterial = mat.clone();
        mesh.userData.roomKey = room.key;
        scene.add(mesh);
        allMeshes.push(mesh);

        ROOM_LABEL_MAP[room.key] = { label: room.label, floor: `Floor ${room.floor}`, type: room.type };
        roomMeshes[room.key] = { meshes: [mesh], highlighted: false, blinking: false, sprite: null,
                                  labelInfo: ROOM_LABEL_MAP[room.key] };
    });

    glbLoaded = true;
    document.getElementById('tb-mode').textContent = 'Procedural Campus (GLB unavailable)';
}

// ═══════════════════════════════════════════════════
// CLICK → ROOM POPUP
// ═══════════════════════════════════════════════════
const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();
let   isDragging     = false;
let   mouseDownPos   = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', e => {
    mouseDownPos = { x: e.clientX, y: e.clientY };
    isDragging = false;
});
renderer.domElement.addEventListener('mousemove', e => {
    const dx = e.clientX - mouseDownPos.x, dy = e.clientY - mouseDownPos.y;
    if (Math.sqrt(dx*dx + dy*dy) > 4) isDragging = true;
});
renderer.domElement.addEventListener('mouseup', e => {
    if (isDragging) return;
    handleCanvasClick(e);
});

// Touch devices
renderer.domElement.addEventListener('touchend', e => {
    if (e.changedTouches.length === 0) return;
    const t = e.changedTouches[0];
    handleCanvasClick({ clientX: t.clientX, clientY: t.clientY });
});

function handleCanvasClick(e) {
    const rect  = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
    mouse.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes, false);

    closeRoomPopup();   // close any open popup first

    if (hits.length === 0) return;

    const hit  = hits[0].object;
    const rKey = hit.userData.roomKey;

    if (!rKey) {
        // Unknown mesh — show generic popup
        showRoomPopup(e.clientX, e.clientY, null, { name: hit.name || 'Unknown', type: 'Unknown' });
        return;
    }

    const info = ROOM_LABEL_MAP[rKey];
    // Find faculty in this room — match by collegeRoom mapping
    const collegeRoom = info?.collegeRoom?.toUpperCase() || '';
    const occupants = facultyData.filter(f => {
        if (!f.current_location) return false;
        const loc = f.current_location.toUpperCase();
        return (
            loc === collegeRoom ||
            loc === rKey.toUpperCase() ||
            loc === rKey.replace('room_', '').toUpperCase() ||
            (collegeRoom && loc.includes(collegeRoom)) ||
            (collegeRoom && collegeRoom.includes(loc))
        );
    });

    showRoomPopup(e.clientX, e.clientY, info, occupants, rKey);

    // Also highlight this room
    clearHighlights();
    highlightRoom(rKey, 0x60a5fa);
}

// ═══════════════════════════════════════════════════
// ROOM POPUP (DOM overlay)
// ═══════════════════════════════════════════════════
let popupEl = null;

function showRoomPopup(x, y, info, occupants, roomKey) {
    closeRoomPopup();

    const popup = document.createElement('div');
    popup.id = 'room-popup';
    popup.style.cssText = `
        position:fixed; z-index:500; pointer-events:auto;
        background:rgba(13,17,23,0.96); backdrop-filter:blur(16px);
        border:1px solid rgba(96,165,250,0.3); border-radius:14px;
        padding:16px 18px; min-width:260px; max-width:320px;
        box-shadow:0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(96,165,250,0.1);
        font-family:'Inter',sans-serif; color:#e6edf3;
        animation: popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
    `;

    // Smart positioning — keep inside viewport
    const vw = window.innerWidth, vh = window.innerHeight;
    const sidebar = 320;
    let px = x + 14, py = y - 10;
    if (px + 340 > vw)  px = x - 340;
    if (px < sidebar)   px = sidebar + 10;
    if (py + 350 > vh)  py = y - 350;
    if (py < 60)        py = 60;
    popup.style.left = px + 'px';
    popup.style.top  = py + 'px';

    const typeIcon = {
        classroom:'🚪', lab:'🔬', cabin:'🪑', library:'📚',
        canteen:'🍽️', hall:'🎓', office:'🏢'
    }[info?.type] || '🏛️';

    const statusColor = { classroom:'#60a5fa', lab:'#a855f7', cabin:'#22c55e',
                          library:'#f59e0b', canteen:'#f97316', hall:'#ec4899' };
    const borderColor = statusColor[info?.type] || '#60a5fa';
    popup.style.borderColor = borderColor + '40';

    let facultyHTML = '';
    if (occupants && occupants.length > 0) {
        facultyHTML = `
        <div style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08)">
            <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#22c55e;margin-bottom:8px">
                👥 Currently Here (${occupants.length})
            </div>
            ${occupants.map(f => {
                const photoSrc = f.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=1e40af&color=ffffff&size=48`;
                const activeInfo = f.active_class_info;
                return `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:8px 10px;
                            background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.18);border-radius:10px;
                            cursor:pointer" onclick="selectFaculty(${f.id}); closeRoomPopup();">
                    <img src="${photoSrc}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid rgba(34,197,94,0.4);flex-shrink:0"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=1e40af&color=ffffff&size=48'">
                    <div style="flex:1;min-width:0">
                        <div style="font-size:0.85rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</div>
                        <div style="font-size:0.72rem;color:#8b949e">${f.designation || f.department || ''}</div>
                        ${activeInfo ? `<div style="font-size:0.7rem;color:#22c55e;margin-top:2px">📖 ${activeInfo.subject} | ${activeInfo.start_time}–${activeInfo.end_time}</div>` : ''}
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    } else {
        facultyHTML = `
        <div style="margin-top:10px;padding:10px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:8px;text-align:center;font-size:0.8rem;color:#f59e0b">
            🟡 No faculty currently scheduled here
        </div>`;
    }

    popup.innerHTML = `
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
            <div>
                <div style="font-size:1.1rem;font-weight:800;display:flex;align-items:center;gap:6px">
                    <span>${typeIcon}</span>
                    <span style="background:linear-gradient(90deg,${borderColor},#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
                        ${info?.label || roomKey || 'Room'}
                    </span>
                </div>
                <div style="font-size:0.75rem;color:#8b949e;margin-top:2px">${info?.floor || ''} · ${(info?.type || 'room').replace(/^\w/, c=>c.toUpperCase())}</div>
            </div>
            <button onclick="closeRoomPopup()" style="background:none;border:none;color:#484f58;cursor:pointer;font-size:1.1rem;padding:0 0 0 8px;line-height:1" title="Close">✕</button>
        </div>
        ${facultyHTML}
        ${roomKey ? `<div style="margin-top:8px;text-align:center">
            <button onclick="selectRoomFromPopup('${roomKey}')" style="
                background:linear-gradient(90deg,rgba(37,99,235,0.2),rgba(168,85,247,0.2));
                border:1px solid rgba(96,165,250,0.3);color:#60a5fa;
                padding:6px 14px;border-radius:8px;cursor:pointer;font-size:0.78rem;font-weight:600;font-family:'Inter',sans-serif">
                🔍 Highlight Room
            </button>
        </div>` : ''}
    `;

    document.body.appendChild(popup);
    popupEl = popup;

    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', outsidePopupClose, { once: true });
    }, 50);
}

function outsidePopupClose(e) {
    if (popupEl && !popupEl.contains(e.target)) closeRoomPopup();
}

function closeRoomPopup() {
    if (popupEl) { popupEl.remove(); popupEl = null; }
    document.removeEventListener('click', outsidePopupClose);
}

function selectRoomFromPopup(roomKey) {
    clearHighlights();
    highlightRoom(roomKey, 0x60a5fa);
    closeRoomPopup();
}

// Inject popup animation keyframes
const popStyle = document.createElement('style');
popStyle.textContent = `@keyframes popIn { from { opacity:0; transform:scale(0.85) translateY(8px); } to { opacity:1; transform:none; } }`;
document.head.appendChild(popStyle);

// ═══════════════════════════════════════════════════
// HOVER GLOW (subtle)
// ═══════════════════════════════════════════════════
let hoveredMesh = null;

renderer.domElement.addEventListener('mousemove', e => {
    if (isDragging) { if (hoveredMesh) resetHover(); return; }
    const rect  = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
    mouse.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes, false);

    if (hits.length > 0 && hits[0].object.userData.roomKey) {
        const obj = hits[0].object;
        if (obj !== hoveredMesh) {
            resetHover();
            hoveredMesh = obj;
            if (!obj.userData.isHighlighted && obj.material && obj.material.emissive) {
                obj.material.emissive = new THREE.Color(0x1a3a6a);
                obj.material.emissiveIntensity = 0.5;
            }
            renderer.domElement.style.cursor = 'pointer';
        }
    } else {
        resetHover();
    }
});

function resetHover() {
    if (hoveredMesh && !hoveredMesh.userData.isHighlighted) {
        if (hoveredMesh.material && hoveredMesh.material.emissive) {
            hoveredMesh.material.emissive = new THREE.Color(0x000000);
            hoveredMesh.material.emissiveIntensity = 0;
        }
    }
    hoveredMesh = null;
    renderer.domElement.style.cursor = 'default';
}

// ═══════════════════════════════════════════════════
// HIGHLIGHT SYSTEM
// ═══════════════════════════════════════════════════
let highlightedRooms = new Set();

function clearHighlights() {
    highlightedRooms.forEach(roomKey => {
        const entry = roomMeshes[roomKey];
        if (!entry) return;
        entry.meshes.forEach(mesh => {
            if (mesh.userData.originalMaterial) {
                mesh.material = Array.isArray(mesh.userData.originalMaterial)
                    ? mesh.userData.originalMaterial.map(m => m.clone())
                    : (mesh.userData.originalMaterial.clone ? mesh.userData.originalMaterial.clone() : mesh.userData.originalMaterial);
            }
            mesh.userData.isHighlighted = false;
        });
        if (entry.sprite) entry.sprite.visible = false;
        entry.highlighted = false;
        entry.blinking    = false;
    });
    highlightedRooms.clear();
    if (activeBeacon) {
        scene.remove(activeBeacon);
        activeBeacon = null;
    }
}

function highlightRoom(roomKey, color = 0x22c55e, shouldFly = true) {
    // Try direct key
    let entry = roomMeshes[roomKey];
    let foundKey = roomKey;

    // Fuzzy fallback — strip "room_" prefix, match by number
    if (!entry) {
        const num = String(roomKey).replace(/\D/g, '');
        for (const [k, v] of Object.entries(roomMeshes)) {
            if (k.replace(/\D/g,'') === num || k.endsWith(roomKey) || roomKey.endsWith(k)) {
                entry = v; foundKey = k; break;
            }
        }
    }
    // Try "room_XXX" variant
    if (!entry && !roomKey.startsWith('room_')) {
        const alt = 'room_' + roomKey.toLowerCase();
        entry = roomMeshes[alt];
        if (entry) foundKey = alt;
    }

    if (!entry || entry.meshes.length === 0) return false;

    const col = new THREE.Color(color);
    entry.meshes.forEach(mesh => {
        const mat = new THREE.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.6,
            roughness: 0.35,
            metalness: 0.15,
            side: THREE.DoubleSide,
        });
        mesh.material = mat;
        mesh.userData.isHighlighted = true;
        mesh.userData.highlightColor = color;
    });
    if (entry.sprite) entry.sprite.visible = true;
    entry.highlighted = true;
    highlightedRooms.add(foundKey);

    // Calculate actual world-space bounding box of the room to place beacon and fly
    const box = new THREE.Box3();
    entry.meshes.forEach(m => box.expandByObject(m));
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Place 3D View destination beacon
    if (activeBeacon) {
        scene.remove(activeBeacon);
        activeBeacon = null;
    }
    const beaconPos = new THREE.Vector3(center.x, box.max.y + 0.1, center.z);
    activeBeacon = createDestinationBeacon(beaconPos);
    scene.add(activeBeacon);

    // Fly smoothly overlooking the room inside 3D View scale
    if (shouldFly) {
        const dist = Math.max(Math.max(size.x, size.z) * 2.2, 18);
        flyTo(
            center.x + dist * 0.7,
            Math.max(center.y + dist * 0.8, 12),
            center.z + dist * 0.7,
            center.x,
            Math.max(center.y, 2),
            center.z
        );
    }
    return true;
}

function highlightRoomBlinking(roomKey) {
    const ok = highlightRoom(roomKey, 0xef4444);
    const entry = roomMeshes[roomKey] || roomMeshes['room_' + roomKey.toLowerCase()];
    if (entry) entry.blinking = true;
    return ok;
}

// Helper used by selectFaculty — tries to highlight+blink, returns bool
function _highlightAndBlink(roomKey) {
    // Try direct
    let entry = roomMeshes[roomKey];
    if (!entry) {
        // Fuzzy — try num suffix match
        const num = String(roomKey).replace(/\D/g,'');
        for (const [k, v] of Object.entries(roomMeshes)) {
            if (num && k.endsWith(num)) { entry = v; roomKey = k; break; }
        }
    }
    if (!entry || entry.meshes.length === 0) return false;
    const ok = highlightRoom(roomKey, 0xef4444);
    if (ok) { if (entry) entry.blinking = true; }
    return ok;
}

function highlightActiveRooms(activeRooms) {
    clearHighlights();
    activeRooms.forEach(room => highlightRoom(room, 0xef4444, false));
}

// ═══════════════════════════════════════════════════
// CAMERA ANIMATION & KEYBOARD GLIDE (from 3D View)
// ═══════════════════════════════════════════════════
let camAnim = null;
function flyTo(ctx, cty, ctz, ttx, tty, ttz) {
    const startCam = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const startTar = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
    
    const endTar = { 
        x: ttx !== undefined ? ttx : startTar.x, 
        y: tty !== undefined ? tty : startTar.y, 
        z: ttz !== undefined ? ttz : startTar.z 
    };

    let t = 0;
    camAnim = { startCam, endCam: { x: ctx, y: cty, z: ctz }, startTar, endTar };
    controls.enabled = false;
    function step() {
        if (!camAnim) {
            controls.enabled = true;
            return;
        }
        t = Math.min(t + 0.02, 1);
        const e = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
        camera.position.set(
            camAnim.startCam.x + (camAnim.endCam.x - camAnim.startCam.x) * e,
            camAnim.startCam.y + (camAnim.endCam.y - camAnim.startCam.y) * e,
            camAnim.startCam.z + (camAnim.endCam.z - camAnim.startCam.z) * e,
        );
        controls.target.set(
            camAnim.startTar.x + (camAnim.endTar.x - camAnim.startTar.x) * e,
            camAnim.startTar.y + (camAnim.endTar.y - camAnim.startTar.y) * e,
            camAnim.startTar.z + (camAnim.endTar.z - camAnim.startTar.z) * e,
        );
        controls.update();
        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            camAnim = null;
            controls.enabled = true;
        }
    }
    requestAnimationFrame(step);
}

function resetCamera() {
    flyTo(DEFAULT_CAM.x, DEFAULT_CAM.y, DEFAULT_CAM.z, DEFAULT_CAM.tx, DEFAULT_CAM.ty, DEFAULT_CAM.tz);
}

// ═══════════════════════════════════════════════════
// ANIMATION & INTERACTION LOOP (from 3D View)
// ═══════════════════════════════════════════════════
const clock = new THREE.Clock();
const keysPressed = {};
window.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    keysPressed[e.code] = true;
    if (e.code === 'KeyR') {
        e.preventDefault();
        resetCamera();
    }
});
window.addEventListener('keyup', e => {
    delete keysPressed[e.code];
});

let lastTime = performance.now();
function animate(now = performance.now()) {
    requestAnimationFrame(animate);
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const t = clock.getElapsedTime();

    // Keyboard WASD / Arrow gliding across campus ground
    const isMoving =
        keysPressed['KeyW'] || keysPressed['KeyS'] || keysPressed['KeyA'] || keysPressed['KeyD'] ||
        keysPressed['ArrowUp'] || keysPressed['ArrowDown'] || keysPressed['ArrowLeft'] || keysPressed['ArrowRight'];

    if (isMoving && controls.enabled && !camAnim) {
        const speed = 28 * delta;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up).normalize();

        const moveVec = new THREE.Vector3();
        if (keysPressed['KeyW'] || keysPressed['ArrowUp']) moveVec.add(forward);
        if (keysPressed['KeyS'] || keysPressed['ArrowDown']) moveVec.sub(forward);
        if (keysPressed['KeyD'] || keysPressed['ArrowRight']) moveVec.add(right);
        if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) moveVec.sub(right);

        if (moveVec.lengthSq() > 0) {
            moveVec.normalize().multiplyScalar(speed);
            camera.position.add(moveVec);
            controls.target.add(moveVec);
        }
    }

    // Target bounding box clamping from 3D View
    if (controls.enabled && !camAnim) {
        controls.target.x = THREE.MathUtils.clamp(controls.target.x, TARGET_BOUNDS.minX, TARGET_BOUNDS.maxX);
        controls.target.y = THREE.MathUtils.clamp(controls.target.y, TARGET_BOUNDS.minY, TARGET_BOUNDS.maxY);
        controls.target.z = THREE.MathUtils.clamp(controls.target.z, TARGET_BOUNDS.minZ, TARGET_BOUNDS.maxZ);
        controls.update();
    }

    Object.values(roomMeshes).forEach(entry => {
        if (entry.highlighted) {
            entry.meshes.forEach(mesh => {
                if (mesh.material && mesh.userData.isHighlighted) {
                    const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3.5));
                    mesh.material.emissiveIntensity = pulse;
                    if (entry.blinking) {
                        mesh.material.opacity   = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 8));
                        mesh.material.transparent = true;
                    }
                }
            });
        }
    });

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ═══════════════════════════════════════════════════
// FACULTY DATA API
// ═══════════════════════════════════════════════════
let facultyData = [];
let activeSelectedFaculty = null;
let pollInterval = null;

async function loadFacultyData() {
    try {
        const res = await fetch('/api/live/');
        if (!res.ok) throw new Error('API error');
        facultyData = await res.json();
        renderFacultyList(facultyData);
        // updateActiveRoomHighlights(); // Disabled automatic startup highlights for a cleaner look
        document.getElementById('tb-mode').textContent =
            `Live — ${facultyData.length} Faculty | ${Object.keys(roomMeshes).length} rooms`;
        document.getElementById('conn-toast').style.display = 'none';
    } catch (e) {
        document.getElementById('conn-toast').className = 'warn';
        console.error('API error:', e);
        facultyData = DEMO_FALLBACK;
        renderFacultyList(facultyData);
    }
}

function updateActiveRoomHighlights() {
    if (activeSelectedFaculty) return;
    const activeRooms = facultyData
        .filter(f => f.is_in_class)
        .map(f => f.current_location)
        .filter(Boolean);
    clearHighlights();
    // Highlight all active rooms without moving the camera (shouldFly = false)
    [...new Set(activeRooms)].forEach(room => highlightRoom(room, 0xef4444, false));
}

// ═══════════════════════════════════════════════════
// FACULTY LIST UI
// ═══════════════════════════════════════════════════
const STATUS_CONFIG = {
    in_class:      { color: '#22c55e', label: 'In Class',   icon: '📍' },
    free:          { color: '#f59e0b', label: 'Free',        icon: '🟡' },
    not_scheduled: { color: '#484f58', label: 'Off Today',   icon: '⚫' },
    overridden:    { color: '#a855f7', label: 'Manual',      icon: '🔵' },
};

function renderFacultyList(list) {
    const el = document.getElementById('faculty-list');
    if (!list || list.length === 0) {
        el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text3);font-size:0.8rem">No faculty found</div>';
        return;
    }
    el.innerHTML = list.map(f => {
        const cfg = STATUS_CONFIG[f.status] || STATUS_CONFIG.not_scheduled;
        const loc = f.current_location || f.default_cabin || '—';
        return `
        <div class="fi ${activeSelectedFaculty === f.id ? 'active' : ''}"
             id="fi-${f.id}" onclick="selectFaculty(${f.id})">
            <div class="fi-status" style="background:${cfg.color}"></div>
            <div class="fi-body">
                <div class="fi-name">${f.name}</div>
                <div class="fi-dept">${f.department || ''}</div>
                <div class="fi-loc">${cfg.icon} ${loc}</div>
            </div>
        </div>`;
    }).join('');
}

// ═══════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════
const searchInput    = document.getElementById('search-input');
const autocompleteEl = document.getElementById('autocomplete');
let   searchTimer    = null;

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = searchInput.value.trim();
    if (!q) { hideAutocomplete(); return; }
    searchTimer = setTimeout(() => doSearch(q), 250);
});

searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') clearSearch();
    if (e.key === 'Enter') {
        hideAutocomplete();
        const q = searchInput.value.trim();
        if (q) searchAndSelectFaculty(q);
    }
});

async function doSearch(q) {
    const results = facultyData.filter(f =>
        f.name.toLowerCase().includes(q.toLowerCase()) ||
        (f.department || '').toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8);

    if (results.length === 0) {
        try {
            const res  = await fetch(`/api/faculty/search/?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            showAutocomplete(data);
        } catch { showAutocomplete(results); }
    } else {
        showAutocomplete(results);
    }
}

function showAutocomplete(results) {
    if (!results.length) { hideAutocomplete(); return; }
    autocompleteEl.innerHTML = results.map(f => {
        const cfg = STATUS_CONFIG[f.status] || STATUS_CONFIG.not_scheduled;
        return `<div class="ac-item" onclick="selectFaculty(${f.id})">
            <div class="ac-status ${f.status}"></div>
            <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:0.85rem">${f.name}</div>
                <div style="font-size:0.72rem;color:var(--text3)">${cfg.label}</div>
            </div>
        </div>`;
    }).join('');
    autocompleteEl.style.display = 'block';
}

function hideAutocomplete() { autocompleteEl.style.display = 'none'; }

document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap')) hideAutocomplete();
});

function clearSearch() {
    searchInput.value = '';
    hideAutocomplete();
    document.getElementById('result-panel').style.display = 'none';
    document.getElementById('ml-panel').style.display = 'none';
    activeSelectedFaculty = null;
    updateActiveRoomHighlights();
    document.querySelectorAll('.fi').forEach(el => el.classList.remove('active'));
}

function searchAndSelectFaculty(q) {
    const match = facultyData.find(f => f.name.toLowerCase().includes(q.toLowerCase()));
    if (match) selectFaculty(match.id); else showNoResult(q);
}

// ═══════════════════════════════════════════════════
// SELECT FACULTY
// ═══════════════════════════════════════════════════
async function selectFaculty(id) {
    hideAutocomplete();
    closeRoomPopup();
    const faculty = facultyData.find(f => f.id === id);
    if (!faculty) return;

    activeSelectedFaculty = id;
    searchInput.value = faculty.name;

    document.querySelectorAll('.fi').forEach(el => el.classList.remove('active'));
    const fiEl = document.getElementById(`fi-${id}`);
    if (fiEl) { fiEl.classList.add('active'); fiEl.scrollIntoView({ behavior:'smooth', block:'nearest' }); }

    showFacultyCard(faculty);
    clearHighlights();

    const loc = faculty.current_location;
    let found = false;
    let foundRoomKey = null;

    if (loc && loc !== 'Unknown') {
        const up = loc.toUpperCase();
        const norm = normalizeRoomKey(loc);

        // 1. COLLEGE_TO_GLB match (Normalized then Exact)
        let glbKey = COLLEGE_TO_GLB[norm] || COLLEGE_TO_GLB[up];
        
        if (!glbKey) {
            // Try fuzzy normalized match
            for (const [c, g] of Object.entries(COLLEGE_TO_GLB)) {
                if (c.includes(norm) || norm.includes(c)) {
                    glbKey = g; break;
                }
            }
        }

        if (glbKey) { found = _highlightAndBlink(glbKey); if (found) foundRoomKey = glbKey; }

        // 2. Direct roomMeshes key
        if (!found) { found = _highlightAndBlink(loc); if (found) foundRoomKey = loc; }

        // 3. room_ prefix with normalization
        if (!found) {
            const k = 'room_' + loc.toLowerCase().replace(/[^a-z0-9]/g, '_');
            found = _highlightAndBlink(k);
            if (found) foundRoomKey = k;
        }

        // 4. Extract number and try that
        if (!found) {
            const num = loc.replace(/\D/g, '');
            if (num && num.length >= 2) {
                const k = 'room_' + num;
                found = _highlightAndBlink(k);
                if (found) foundRoomKey = k;
            }
        }
    }

    // ─ Show 3D canvas popup pointing to the room ─
    if (foundRoomKey) {
        setTimeout(() => {
            const info  = ROOM_LABEL_MAP[foundRoomKey];
            const entry = roomMeshes[foundRoomKey];
            const mesh  = entry && entry.meshes && entry.meshes[0];
            if (!mesh || !info) return;
            // Convert 3D → 2D screen position
            const vec = mesh.position.clone().project(camera);
            const cw = renderer.domElement.clientWidth || window.innerWidth - 320;
            const ch = renderer.domElement.clientHeight || window.innerHeight;
            const SB = 320;
            let sx = ((vec.x + 1) / 2) * cw + SB;
            let sy = (-(vec.y - 1) / 2) * ch;
            sx = Math.min(Math.max(sx, SB + 10), window.innerWidth - 350);
            sy = Math.min(Math.max(sy, 60), window.innerHeight - 260);
            showFacultyRoomPopup(sx, sy, faculty, info, foundRoomKey);
        }, 400); // small delay so camera fly starts first
    } else {
        setTimeout(() => {
            const cw = renderer.domElement.clientWidth || window.innerWidth - 320;
            const ch = renderer.domElement.clientHeight || window.innerHeight;
            const SB = 320;
            let sx = SB + cw / 2 - 150;
            let sy = ch / 2 - 100;
            showFacultyRoomPopup(sx, sy, faculty, null, null);
        }, 100);
    }

    // ML predictions for free/unscheduled faculty
    if (!found || faculty.status === 'not_scheduled' || faculty.status === 'free') {
        try {
            const res  = await fetch(`/api/predict/${id}/`);
            const data = await res.json();
            showMLPredictions(data.predictions, faculty.name);
        } catch {
            document.getElementById('ml-panel').style.display = 'none';
        }
    } else {
        document.getElementById('ml-panel').style.display = 'none';
    }
}

function showFacultyCard(f) {
    const panel    = document.getElementById('result-panel');
    const cfg      = STATUS_CONFIG[f.status] || STATUS_CONFIG.not_scheduled;
    const photoSrc = f.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=1e40af&color=ffffff&size=96`;
    const ai       = f.active_class_info;

    panel.style.display = 'block';
    panel.innerHTML = `
        <div class="rc-header ${f.status === 'in_class' ? '' : f.status === 'free' ? 'predicted' : 'notfound'}">
            ${f.status === 'in_class' ? '✅ Currently In Class' : f.status === 'free' ? '🟡 Free Period' : '⚫ Not Scheduled'}
        </div>
        <div class="profile-row">
            <img class="profile-photo" src="${photoSrc}" alt="${f.name}"
                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=1e40af&color=ffffff&size=96'">
            <div>
                <div class="profile-name">${f.name}</div>
                <div class="profile-dept">${f.designation || ''} ${f.department ? '· ' + f.department : ''}</div>
            </div>
        </div>
        <div class="profile-meta">
            ${f.qualification  ? `<span><i class="fas fa-graduation-cap" style="width:14px;color:var(--text3)"></i> ${f.qualification}</span>` : ''}
            ${f.specialization ? `<span><i class="fas fa-star" style="width:14px;color:var(--text3)"></i> ${f.specialization}</span>` : ''}
            ${f.cabin_number   ? `<span><i class="fas fa-door-open" style="width:14px;color:var(--text3)"></i> Cabin: ${f.cabin_number}</span>` : ''}
        </div>
        ${ai ? `
        <div class="rc-location">
            <i class="fas fa-map-marker-alt"></i>
            Room ${f.current_location} — ${ai.subject || 'Class'}
            <br><small style="font-size:0.7rem;color:var(--text2)">${ai.start_time}–${ai.end_time} | ${ai.course} ${ai.year} ${ai.branch}</small>
        </div>` : `
        <div class="rc-location" style="color:${cfg.color}">
            <i class="fas fa-map-pin"></i>
            ${f.current_location && f.current_location !== 'Unknown' ? f.current_location : 'Location Unknown'}
        </div>`}
    `;
}

// ═══════════════════════════════════════════════════
// FACULTY ROOM POPUP — shows on 3D canvas when faculty is selected
// ═══════════════════════════════════════════════════
function showFacultyRoomPopup(x, y, faculty, roomInfo, roomKey) {
    closeRoomPopup();

    const statusColors = { in_class:'#22c55e', free:'#f59e0b', not_scheduled:'#484f58', overridden:'#a855f7' };
    const typeIcons    = { classroom:'🚪', lab:'🔬', cabin:'🪑', library:'📚', canteen:'🍽️', hall:'🎓', office:'🏢' };
    const sColor = statusColors[faculty.status] || '#60a5fa';
    const tIcon  = roomInfo ? (typeIcons[roomInfo.type] || '🏛️') : '❌';
    const ai     = faculty.active_class_info;
    const photoSrc = faculty.photo_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=1e40af&color=ffffff&size=80`;

    const popup = document.createElement('div');
    popup.id = 'room-popup';
    popup.style.cssText = `
        position:fixed; z-index:500; pointer-events:auto;
        background:rgba(10,14,20,0.97); backdrop-filter:blur(20px);
        border:1.5px solid ${sColor}40;
        border-radius:16px; padding:0;
        min-width:300px; max-width:340px;
        box-shadow:0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px ${sColor}20, 0 0 40px ${sColor}10;
        font-family:'Inter',sans-serif; color:#e6edf3;
        animation:popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
        overflow:hidden;
    `;
    popup.style.left = x + 'px';
    popup.style.top  = y + 'px';

    popup.innerHTML = `
        <!-- Header strip -->
        <div style="background:linear-gradient(135deg,${sColor}22,${sColor}08);padding:14px 16px 10px;border-bottom:1px solid ${sColor}25;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                <div style="display:flex;align-items:center;gap:10px">
                    <img src="${photoSrc}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid ${sColor}60;
                         flex-shrink:0" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=1e40af&color=ffffff&size=80'">
                    <div style="min-width:0">
                        <div style="font-size:0.9rem;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px">${faculty.name}</div>
                        <div style="font-size:0.72rem;color:#8b949e;margin-top:1px">${faculty.designation || ''}</div>
                    </div>
                </div>
                <button onclick="closeRoomPopup()" style="background:none;border:none;color:#484f58;cursor:pointer;font-size:1rem;padding:0;line-height:1;flex-shrink:0" title="Close">✕</button>
            </div>
            <!-- Status badge -->
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:99px;background:${sColor}18;border:1px solid ${sColor}35;font-size:0.72rem;font-weight:700;color:${sColor}">
                <div style="width:7px;height:7px;border-radius:50%;background:${sColor}"></div>
                ${ faculty.status==='in_class'?'IN CLASS' : faculty.status==='free'?'FREE PERIOD' : 'NOT SCHEDULED' }
            </div>
        </div>

        <!-- Room info -->
        <div style="padding:12px 16px;">
            <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#484f58;margin-bottom:6px">📍 CURRENT LOCATION</div>
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:linear-gradient(135deg,${sColor}10,transparent);border:1px solid ${sColor}25;border-radius:10px">
                <span style="font-size:1.6rem">${tIcon}</span>
                <div style="flex:1;min-width:0">
                    <div style="font-size:0.95rem;font-weight:800;background:linear-gradient(90deg,${sColor},#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${roomInfo ? roomInfo.label : 'Not Available'}</div>
                    <div style="font-size:0.72rem;color:#8b949e;margin-top:2px">${roomInfo ? (roomInfo.floor + ' · ' + (roomInfo.type||'room').replace(/^\w/,c=>c.toUpperCase())) : 'Room not found in 3D model'}</div>
                </div>
            </div>

            ${ ai ? `
            <div style="margin-top:8px;padding:8px 12px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:8px">
                <div style="font-size:0.75rem;font-weight:700;color:#22c55e;margin-bottom:3px">📖 ${ai.subject}</div>
                <div style="font-size:0.7rem;color:#8b949e">${ai.start_time}–${ai.end_time} | ${ai.course} ${ai.year} ${ai.branch}</div>
            </div>` : `` }

            <!-- Action buttons -->
            <div style="display:flex;gap:8px;margin-top:10px">
                ${ roomKey ? `<button onclick="selectRoomFromPopup('${roomKey}')" style="flex:1;padding:7px;border-radius:8px;border:1px solid ${sColor}35;background:${sColor}12;color:${sColor};font-size:0.75rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:background 0.2s" onmouseover="this.style.background='${sColor}22'" onmouseout="this.style.background='${sColor}12'">
                    🔍 Zoom In
                </button>` : '' }
                <button onclick="closeRoomPopup(); clearSearch();" style="flex:${roomKey ? 'none' : '1'};padding:7px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#8b949e;font-size:0.75rem;cursor:pointer;font-family:'Inter',sans-serif">
                    ${roomKey ? '✕' : 'Close'}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);
    popupEl = popup;
    setTimeout(() => {
        document.addEventListener('click', outsidePopupClose, { once:true });
    }, 80);
}

function showMLPredictions(predictions, name) {
    if (!predictions || predictions.length === 0) return;
    const panel   = document.getElementById('ml-panel');
    const itemsEl = document.getElementById('ml-items');
    itemsEl.innerHTML = predictions.map((p, i) => `
        <div class="ml-item" onclick="highlightRoom('${p.room}', 0xf59e0b)">
            <div class="ml-rank">${i + 1}</div>
            <div class="ml-room">${p.label || 'Room ' + p.room}</div>
            <div class="ml-bar-wrap"><div class="ml-bar" style="width:${Math.min(100, p.confidence)}%"></div></div>
            <div class="ml-pct">${p.confidence}%</div>
        </div>`).join('');
    panel.style.display = 'block';
}

function showNoResult(q) {
    const panel = document.getElementById('result-panel');
    panel.style.display = 'block';
    panel.innerHTML = `
        <div class="rc-header notfound">❌ Not Found</div>
        <div style="font-size:0.82rem;color:var(--text2)">No faculty matching "<strong>${q}</strong>"</div>
    `;
}

// ═══════════════════════════════════════════════════
// LIVE REFRESH + CLOCK + THEME
// ═══════════════════════════════════════════════════
async function refreshData() {
    const icon = document.getElementById('refresh-icon');
    icon.className = 'fas fa-sync-alt fa-spin';
    await loadFacultyData();
    setTimeout(() => icon.className = 'fas fa-sync-alt', 800);
}

function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(loadFacultyData, 60000);
}
startPolling();

function updateClock() {
    const now  = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const h = now.getHours().toString().padStart(2,'0');
    const m = now.getMinutes().toString().padStart(2,'0');
    const s = now.getSeconds().toString().padStart(2,'0');
    document.getElementById('live-clock').textContent = `📅 ${days[now.getDay()]}  🕐 ${h}:${m}:${s}`;
}
updateClock(); setInterval(updateClock, 1000);

function toggleTheme() {
    const html  = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('theme-icon').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    const bgCol = isDark ? 0xf1f5f9 : 0x0f172a;
    scene.background = new THREE.Color(bgCol);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}
(function initTheme() {
    const t = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
    if (t === 'light') {
        document.getElementById('theme-icon').className = 'fas fa-sun';
        scene.background = new THREE.Color(0xf1f5f9);
    } else {
        document.getElementById('theme-icon').className = 'fas fa-moon';
        scene.background = new THREE.Color(0x0f172a);
    }
})();

// ═══════════════════════════════════════════════════
// DEMO FALLBACK DATA
// ═══════════════════════════════════════════════════
const DEMO_FALLBACK = [
    { id:9,  name:'Dr. Rajesh Kumar Sharma', department:'Computer Science & Engineering',
      designation:'Professor & HOD', status:'in_class', current_location:'101', is_in_class:true,
      photo_url:null, cabin_number:'HOD-CSE', qualification:'Ph.D.(CSE)', specialization:'Machine Learning, Data Structures',
      active_class_info:{ subject:'Data Structures', course:'B.E.', year:'2nd', semester:'3rd', branch:'CSE', start_time:'09:00', end_time:'10:00' } },

    { id:10, name:'Dr. Priya Verma', department:'Computer Science & Engineering',
      designation:'Associate Professor', status:'in_class', current_location:'102', is_in_class:true,
      photo_url:null, cabin_number:'C-201', qualification:'Ph.D.(AI)', specialization:'Artificial Intelligence, Deep Learning',
      active_class_info:{ subject:'Artificial Intelligence', course:'B.E.', year:'4th', semester:'7th', branch:'CSE', start_time:'10:00', end_time:'11:00' } },

    { id:11, name:'Prof. Amit Singh', department:'Electronics & Communication',
      designation:'Assistant Professor', status:'free', current_location:'C-205', is_in_class:false,
      photo_url:null, cabin_number:'C-205', qualification:'M.Tech(ECE)', specialization:'VLSI Design, Embedded Systems',
      active_class_info:null },

    { id:12, name:'Dr. Sunita Patel', department:'Mechanical Engineering',
      designation:'Associate Professor', status:'in_class', current_location:'301', is_in_class:true,
      photo_url:null, cabin_number:'C-301', qualification:'Ph.D.(Thermal Engg)', specialization:'Thermodynamics, Fluid Mechanics',
      active_class_info:{ subject:'Thermodynamics', course:'B.E.', year:'2nd', semester:'3rd', branch:'ME', start_time:'09:00', end_time:'10:00' } },

    { id:13, name:'Prof. Vikram Joshi', department:'Computer Science & Engineering',
      designation:'Assistant Professor', status:'free', current_location:'C-202', is_in_class:false,
      photo_url:null, cabin_number:'C-202', qualification:'M.Tech(SE)', specialization:'Web Technologies, Database Systems',
      active_class_info:null },

    { id:14, name:'Dr. Meena Gupta', department:'Mathematics',
      designation:'Professor', status:'in_class', current_location:'401', is_in_class:true,
      photo_url:null, cabin_number:'C-401', qualification:'Ph.D.(Maths)', specialization:'Discrete Mathematics, Statistics',
      active_class_info:{ subject:'Engineering Mathematics', course:'B.E.', year:'2nd', semester:'3rd', branch:'CSE', start_time:'08:00', end_time:'09:00' } },
];
