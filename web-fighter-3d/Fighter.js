import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Fighter {
    constructor(color, x, z, facingRight = true) {
        this.color = color;
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);

        // Physics/Movement state
        this.velocity = new THREE.Vector3(0, 0, 0); // Z included by default in Vector3, but clarifying
        this.isGrounded = false;
        this.facingRight = facingRight;
        this.actionState = 'IDLE'; // IDLE, ATTACK, HIT
        this.actionTimer = 0;
        this.hp = 100;
        this.maxHp = 100;

        // Visual Style Settings
        this.scale = 1.2; // Slightly larger overall
        this.outlineThickness = 0.008; // Thinner, sharper lines
        this.outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });

        // Animation System (External Model)
        this.mixer = null;
        this.actions = {};
        this.isModelLoaded = false;
        this.modelUrl = null; // Set this later to a specific .glb file

        // Visual parts (Procedural Fallback)
        this.parts = {};
        this.createBody(); // Default to procedural first
        this.updateFacing();
    }

    // New: Load External Model (Professional Standard)
    loadModel(url, scaleOverride = 1.0, onLoaded = null) {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            console.log('Model loaded:', url);

            // 1. Clean up procedural mesh
            while (this.mesh.children.length > 0) {
                this.mesh.remove(this.mesh.children[0]);
            }

            // 2. Setup New Model
            this.model = gltf.scene;

            // Correction for "Soldier.glb" specifically (it's small)
            // Procedural character is ~4.5 units tall. Soldier is ~2 units.
            // We need to scale it up to match the "Heroic" size.
            const finalScale = this.scale * scaleOverride;
            this.model.scale.set(finalScale, finalScale, finalScale);

            // Enable Shadows
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            this.mesh.add(this.model);

            // 3. Setup Animations
            this.mixer = new THREE.AnimationMixer(this.model);

            // Smart Mapping for common clip names
            this.actionMap = {
                idle: 'Idle',
                run: 'Run',
                punch: 'Punch',
                kick: 'Kick'
            };

            gltf.animations.forEach((clip) => {
                this.actions[clip.name] = this.mixer.clipAction(clip);
                const lowerName = clip.name.toLowerCase();

                if (lowerName.includes('idle')) this.actionMap.idle = clip.name;
                if (lowerName.includes('run')) this.actionMap.run = clip.name;
                if (lowerName.includes('punch')) this.actionMap.punch = clip.name;
                if (lowerName.includes('kick')) this.actionMap.kick = clip.name;
            });
            console.log('Animation Map:', this.actionMap);

            // Start Idle
            const idleClip = this.actionMap.idle;
            if (this.actions[idleClip]) this.actions[idleClip].play();

            this.isModelLoaded = true;

            // 触发模型加载完成事件
            window.dispatchEvent(new CustomEvent('modelLoaded', { detail: { fighter: this } }));

            if (onLoaded) onLoaded();

        }, undefined, (error) => {
            console.warn('Failed to load model:', url, 'Fallback to procedural.');
        });
    }

    createBody() {
        // --- 1. Materials & Textures ---
        // Cel-Shading Gradient: 3-step for anime look
        const formatTexture = (ctx) => {
            const canvas = document.createElement('canvas');
            canvas.width = 4; canvas.height = 1;
            const c = canvas.getContext('2d');
            c.fillStyle = '#666666'; c.fillRect(0, 0, 1, 1); // Shadow
            c.fillStyle = '#aaaaaa'; c.fillRect(1, 0, 1, 1); // Mid
            c.fillStyle = '#eeeeee'; c.fillRect(2, 0, 1, 1); // Light
            c.fillStyle = '#ffffff'; c.fillRect(3, 0, 1, 1); // Highlight
            const tex = new THREE.CanvasTexture(canvas);
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            return tex;
        };
        const gradientMap = formatTexture();

        // Colors
        const skinColor = 0xffe0c4;
        let shirtColor, pantsColor, hairColor, gearColor;

        if (this.color === 0xff3333) {
            // P1: Kyo/Ryu (White/Red/Black)
            shirtColor = 0xf0f0f0;
            pantsColor = 0x1a1a1a;
            hairColor = 0x3d2b1f;
            gearColor = 0xcc0000;
        } else {
            // P2: Iori/Terry (Red/Black/Silver)
            shirtColor = 0x111111;
            pantsColor = 0xb30000;
            hairColor = 0xeeeeee;
            gearColor = 0x222222;
        }

        const mat = (col) => new THREE.MeshToonMaterial({ color: col, gradientMap });
        const skinMat = mat(skinColor);
        const shirtMat = mat(shirtColor);
        const pantsMat = mat(pantsColor);
        const hairMat = mat(hairColor);
        const gearMat = mat(gearColor);
        const blackMat = mat(0x111111);

        // --- 2. HEROIC BODY CONSTRUCTION (7.5 Head Ratio) ---

        // A. Torso (V-Taper)
        // Chest: V-shaped cylinder
        const chestGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.75, 8);
        this.parts.chest = this.createPosingMesh(chestGeo, shirtMat);
        this.parts.chest.position.y = 3.8; // Raised COG
        this.parts.chest.scale.set(1.4, 1.0, 0.9);
        this.mesh.add(this.parts.chest);

        // Abdomen: Tapered waist
        const absGeo = new THREE.CylinderGeometry(0.42, 0.38, 0.65, 8);
        this.parts.abdomen = this.createPosingMesh(absGeo, shirtMat);
        this.parts.abdomen.position.y = -0.6;
        this.parts.chest.add(this.parts.abdomen);

        // Pelvis: Hips
        const pelvisGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.5, 8);
        this.parts.pelvis = this.createPosingMesh(pelvisGeo, pantsMat);
        this.parts.pelvis.position.y = -0.55;
        this.parts.abdomen.add(this.parts.pelvis);

        // Belt System
        const beltGeo = new THREE.TorusGeometry(0.42, 0.08, 6, 12);
        const belt = this.createPosingMesh(beltGeo, gearMat);
        belt.rotation.x = Math.PI / 2;
        belt.scale.set(1, 1, 1.2);
        this.parts.pelvis.add(belt);

        // B. Anime Head (Detailed)
        this.parts.head = this.createAnimeHead(skinMat, hairMat, gearMat);
        this.parts.head.position.set(0, 0.55, 0);
        this.parts.chest.add(this.parts.head);

        // C. Limbs (Elongated & Tapered)
        this.parts.arms = {};
        this.parts.legs = {};

        // Arms: Broad shoulders, defined forearms
        this.parts.arms.left = this.createComplexLimb(shirtMat, skinMat, gearMat, -1, false);
        this.parts.chest.add(this.parts.arms.left);
        this.parts.arms.left.position.set(-0.65, 0.3, 0);

        this.parts.arms.right = this.createComplexLimb(shirtMat, skinMat, gearMat, 1, false);
        this.parts.chest.add(this.parts.arms.right);
        this.parts.arms.right.position.set(0.65, 0.3, 0);

        // Legs: Long, flared pants
        // Hip spacing adjusted
        this.parts.legs.left = this.createComplexLimb(pantsMat, pantsMat, blackMat, -1, true);
        this.mesh.add(this.parts.legs.left);
        this.parts.legs.left.position.set(-0.35, 2.2, 0);

        this.parts.legs.right = this.createComplexLimb(pantsMat, pantsMat, blackMat, 1, true);
        this.mesh.add(this.parts.legs.right);
        this.parts.legs.right.position.set(0.35, 2.2, 0);
    }

    createAnimeHead(skinMat, hairMat, gearMat) {
        const group = new THREE.Group();

        // 1. Jaw/Chin (Sharp anime style)
        const jawGeo = new THREE.ConeGeometry(0.28, 0.45, 5);
        const jaw = this.createPosingMesh(jawGeo, skinMat);
        jaw.rotation.z = Math.PI; // Point down
        jaw.position.y = -0.1;
        jaw.scale.set(1, 0.8, 1);
        group.add(jaw);

        // 2. Cranium
        const headGeo = new THREE.BoxGeometry(0.45, 0.4, 0.5);
        // Smooth it visually with subdivision modifier or just use Sphere for simplicity
        const cranium = this.createPosingMesh(new THREE.SphereGeometry(0.33, 10, 10), skinMat);
        cranium.position.y = 0.15;
        cranium.scale.z = 1.1;
        group.add(cranium);

        // 3. Eyes (Angry/Focused)
        const eyeGeo = new THREE.PlaneGeometry(0.12, 0.04);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

        const makeEye = (x, rotZ) => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(x, 0.08, 0.28);
            eye.rotation.y = x > 0 ? 0.3 : -0.3; // Wrap around face
            eye.rotation.z = rotZ; // Angry tilt
            return eye;
        };
        group.add(makeEye(-0.12, -0.25));
        group.add(makeEye(0.12, 0.25));

        // 4. Hair
        const hairGroup = new THREE.Group();
        group.add(hairGroup);

        const addSpike = (x, y, z, sX, sY, sZ, rX, rY, rZ) => {
            const spike = this.createPosingMesh(new THREE.ConeGeometry(0.08, 0.5, 4), hairMat);
            spike.position.set(x, y, z);
            spike.scale.set(sX, sY, sZ);
            spike.rotation.set(rX, rY, rZ);
            hairGroup.add(spike);
        };

        if (this.color === 0xff3333) { // P1: Hero Spikes
            for (let i = 0; i < 12; i++) {
                addSpike(
                    (Math.random() - 0.5) * 0.5,
                    0.3 + Math.random() * 0.1,
                    (Math.random() - 0.5) * 0.5,
                    1 + Math.random(), 1 + Math.random(), 1,
                    (Math.random() - 0.5), Math.random() * 6, (Math.random() - 0.5)
                );
            }
            // Headband
            const bandGeo = new THREE.TorusGeometry(0.34, 0.04, 4, 16);
            const band = this.createPosingMesh(bandGeo, gearMat);
            band.rotation.x = Math.PI / 2;
            band.position.y = 0.2;
            band.scale.set(1, 1.1, 1);
            hairGroup.add(band);
        } else { // P2: Emo Fringe
            // Front Bangs
            addSpike(0.15, 0.1, 0.35, 1.5, 1.8, 1, -0.2, 0, -0.3);
            addSpike(0.0, 0.15, 0.38, 1.2, 1.5, 1, -0.1, 0, 0);
            // Long Back
            addSpike(0, 0, -0.3, 3, 2, 2, -1.2, 0, 0);
        }

        return group;
    }

    createPosingMesh(geo, mat) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        // Outline
        const outline = new THREE.Mesh(geo, this.outlineMat);
        const thickness = 0.005; // Finer outline
        outline.scale.multiplyScalar(1.0 + thickness);
        if (geo.type === 'BoxGeometry') outline.scale.addScalar(thickness);
        mesh.add(outline);
        return mesh;
    }

    createComplexLimb(upperMat, lowerMat, endMat, side, isLeg) {
        const group = new THREE.Group();

        // Proportions: Heroic = Long legs, decent arms
        const upperLen = isLeg ? 1.2 : 0.9;
        const lowerLen = isLeg ? 1.3 : 0.9;
        const thick = isLeg ? 0.3 : 0.24;

        // Shoulder/Hip Joint
        const jointBlob = this.createPosingMesh(new THREE.SphereGeometry(thick), upperMat);
        group.add(jointBlob);

        // Upper Limb (Muscle Taper)
        const upperGeo = new THREE.CylinderGeometry(thick * 1.1, thick * 0.8, upperLen, 8);
        const upper = this.createPosingMesh(upperGeo, upperMat);
        upper.position.y = -upperLen / 2;
        group.add(upper);

        // Elbow/Knee Group
        const lowerGroup = new THREE.Group();
        lowerGroup.position.y = -upperLen;
        group.add(lowerGroup);
        group.lower = lowerGroup;

        // Elbow/Knee Joint
        const midJoint = this.createPosingMesh(new THREE.SphereGeometry(thick * 0.85), lowerMat);
        lowerGroup.add(midJoint);

        // Lower Limb (Forearm/Calf)
        // Leg: Bell-bottom / flared pants effect
        const lowerTop = thick * 0.8;
        const lowerBot = isLeg ? thick * 1.4 : thick * 0.6; // Flare for pants, taper for wrist
        const lowerGeo = new THREE.CylinderGeometry(lowerTop, lowerBot, lowerLen, 8);
        const lower = this.createPosingMesh(lowerGeo, lowerMat);
        lower.position.y = -lowerLen / 2;
        lowerGroup.add(lower);

        // Hand / Foot
        let endMesh;
        if (isLeg) {
            // Combat Boot
            const bootGeo = new THREE.BoxGeometry(0.28, 0.3, 0.7);
            endMesh = this.createPosingMesh(bootGeo, endMat);
            endMesh.position.set(0, -lowerLen, 0.2);
            // Detail
            const tip = this.createPosingMesh(new THREE.BoxGeometry(0.3, 0.15, 0.3), endMat);
            tip.position.z = 0.35; tip.position.y = -0.08;
            endMesh.add(tip);
        } else {
            // MMA Glove / Fist
            const fistGeo = new THREE.BoxGeometry(0.35, 0.35, 0.4);
            endMesh = this.createPosingMesh(fistGeo, endMat);
            endMesh.position.y = -lowerLen;
        }
        lowerGroup.add(endMesh);

        return group;
    }

    attack(type) {
        if (this.actionState !== 'IDLE') return;

        this.actionState = 'ATTACK';
        this.attackType = type; // 'punch' | 'kick'
        this.actionTimer = 0;
        this.isAttackingHitboxActive = false;

        // Model Animation Trigger
        if (this.isModelLoaded && this.actions) {
            // Map 'type' to clip names via actionMap
            const key = type === 'punch' ? 'punch' : 'kick';
            let clipName = this.actionMap[key];
            let action = this.actions[clipName];

            if (!action) {
                // FALLBACK: If specific attack is missing, use Run for Bash
                const runKey = this.actionMap.run;
                if (this.actions[runKey]) {
                    action = this.actions[runKey];
                    action.setDuration(0.5); // Fast burst
                }
            }

            if (action) {
                // Stop other actions (except Idle for smooth blending, but usually stop all non-idles)
                Object.values(this.actions).forEach(a => {
                    if (a !== action && a.getClip().name !== this.actionMap.idle) a.stop();
                });

                action.reset().setLoop(THREE.LoopOnce).play();

                // If we used Run as attack, return to normal speed after
                if (action === this.actions[this.actionMap.run]) {
                    setTimeout(() => { action.setDuration(1.0); }, 500);
                }
            }
        }

        // Randomize attack slightly for variety (Procedural only)
        this.attackVariant = Math.random() > 0.5 ? 0 : 1;
    }

    takeDamage(amount) {
        if (this.actionState === 'DEAD') return;

        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.actionState = 'DEAD';
            this.velocity.y = 5;
            return;
        }

        this.actionState = 'HIT';
        this.actionTimer = 0;
        this.velocity.x = this.facingRight ? -5 : 5; // Knockback
        this.velocity.y = 5;
        this.isGrounded = false;

        // Flash effect
        this.mesh.traverse((child) => {
            if (child.isMesh && child.material.emissive) {
                child.material.emissive.setHex(0x555555); // Flash Gray/White
                setTimeout(() => {
                    if (child.material.emissive) child.material.emissive.setHex(0x000000); // Reset to Black
                }, 100);
            }
        });
    }

    updateAttackState(delta) {
        this.actionTimer += delta;
        const duration = 0.4; // Slightly longer for better animation

        // Hitbox Window (Sweet spot)
        if (this.actionTimer > 0.15 && this.actionTimer < 0.3) {
            this.isAttackingHitboxActive = true;
        } else {
            this.isAttackingHitboxActive = false;
        }

        if (this.actionTimer > duration) {
            this.actionState = 'IDLE';
            this.isAttackingHitboxActive = false;
            this.resetLimbs();
        }
        return { type: this.attackType, active: this.isAttackingHitboxActive };
    }

    updateHitState(delta) {
        this.actionTimer += delta;
        if (this.actionTimer > 0.4) {
            this.actionState = 'IDLE';
            this.velocity.x = 0;
            this.resetLimbs();
        }
    }

    resetLimbs() {
        // Now handled by animate() for dynamic KOF stances, 
        // but we can ensure base positions here.
    }

    getHitbox() {
        const range = 2.5;
        const x = this.mesh.position.x + (this.facingRight ? range / 2 + 0.5 : -range / 2 - 0.5);
        const y = this.mesh.position.y + 2;
        const z = this.mesh.position.z;
        return { x, y, z, width: range, height: 2, depth: 2 };
    }

    updateFacing() {
        this.mesh.rotation.y = this.facingRight ? 0 : Math.PI;
    }

    update(delta, groundY, inputState = {}) {
        const MOVEMENT_SPEED = 10;
        const JUMP_FORCE = 15;

        // --- Action State Logic ---
        this.info = { type: 'none', active: false };

        if (this.actionState === 'DEAD') {
            this.velocity.x = 0;
        } else if (this.actionState === 'ATTACK') {
            this.info = this.updateAttackState(delta);
        } else if (this.actionState === 'HIT') {
            this.updateHitState(delta);
        } else {
            this.updateMovement(delta, inputState, MOVEMENT_SPEED, JUMP_FORCE);
        }

        // --- Physics ---
        this.velocity.y -= 30 * delta;
        this.mesh.position.x += this.velocity.x * delta;
        this.mesh.position.y += this.velocity.y * delta;
        this.mesh.position.z += this.velocity.z * delta; // Z Update

        // --- Ground & Bounds ---
        if (this.mesh.position.y <= groundY) {
            this.mesh.position.y = groundY;
            this.velocity.y = 0;
            this.isGrounded = true;
            if (this.actionState !== 'HIT' && !inputState.left && !inputState.right && !inputState.up && !inputState.down) {
                this.velocity.x = 0;
                this.velocity.z = 0;
            }
        } else {
            this.isGrounded = false;
        }

        // X Bounds
        if (this.mesh.position.x < -38) this.mesh.position.x = -38;
        if (this.mesh.position.x > 38) this.mesh.position.x = 38;

        // Z Bounds (Depth)
        if (this.mesh.position.z < -20) this.mesh.position.z = -20;
        if (this.mesh.position.z > 20) this.mesh.position.z = 20;

        this.updateFacing();
        this.animate(delta);
    }

    updateMovement(delta, inputState, speed, jumpForce) {
        this.velocity.x = 0;
        this.velocity.z = 0;
        if (this.hp <= 0) return;

        if (inputState.punch) {
            this.attack('punch');
            return;
        }
        if (inputState.kick) {
            this.attack('kick');
            return;
        }

        // X Movement
        if (inputState.left) {
            this.velocity.x = -speed;
            this.facingRight = false;
        } else if (inputState.right) {
            this.velocity.x = speed;
            this.facingRight = true;
        }

        // Z Movement (3D)
        // Check for specific keys mapped in game.js passed as inputState
        // inputState structure: { left, right, up (w), down (s), jump, punch, kick }
        if (inputState.up) { // W key
            this.velocity.z = -speed * 0.7; // Away
        } else if (inputState.down) { // S key
            this.velocity.z = speed * 0.7; // Toward
        }

        if (inputState.jump && this.isGrounded) {
            this.velocity.y = jumpForce;
            this.isGrounded = false;
        }
    }

    animate(delta) {
        // --- HYBRID ANIMATION SYSTEM ---

        // 1. External Model Mode (Skeletal Animation)
        if (this.isModelLoaded) {
            if (this.mixer) this.mixer.update(delta);
            this.updateFacing();

            // Loop animations State Machine
            if (this.actionState === 'IDLE' || this.actionState === 'MOVE' || this.actionState === 'JUMP') {
                const isMoving = this.velocity.length() > 0.1;
                const targetKey = isMoving ? 'run' : 'idle';
                const clipName = this.actionMap[targetKey];

                // Play target if available and not already playing
                if (this.actions[clipName]) {
                    const action = this.actions[clipName];
                    if (!action.isRunning()) {
                        // Stop others
                        Object.values(this.actions).forEach(a => {
                            if (a !== action && a.isRunning()) a.fadeOut(0.2);
                        });
                        action.reset().fadeIn(0.2).play();
                    }
                }
            }
            return;
        }

        // 2. Procedural Fallback Mode (Math-based Animation)
        const time = Date.now() * 0.005;

        if (this.actionState === 'DEAD') {
            // Smoothly fall over
            const targetRot = Math.PI / 2 * (this.facingRight ? -1 : 1);
            this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, targetRot, 0.1);

            this.parts.arms.left.rotation.z = -1.5;
            this.parts.arms.right.rotation.z = 1.5;
            return;
        }

        // --- GLOBAL RESET (Stand up) ---
        // Ensure character is vertical when not dead
        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, 0.1);
        this.mesh.rotation.x = 0;

        // --- KOF Style Stance Logic ---
        const breathing = Math.sin(time * 3) * 0.05;
        this.parts.chest.position.y = 3.6 + breathing;
        this.parts.abdomen.rotation.x = breathing * 0.5;
        this.parts.head.rotation.x = -breathing * 0.5;

        if (this.actionState === 'ATTACK') {
            const progress = Math.min(this.actionTimer / 0.4, 1.0);
            const attackCurve = Math.sin(progress * Math.PI);

            if (this.attackType === 'punch') {
                this.parts.chest.rotation.y = (this.facingRight ? -0.6 : 0.6) * attackCurve;
                this.parts.arms.right.rotation.x = -Math.PI / 2;
                this.parts.arms.right.lower.rotation.x = -0.2 * attackCurve;
                this.parts.arms.right.lower.position.z = 0.6 * attackCurve;
            } else {
                // Kick
                this.parts.chest.rotation.x = -0.3 * attackCurve;
                this.parts.legs.right.rotation.x = -Math.PI / 2 * 1.2 * attackCurve;
                this.parts.legs.right.lower.rotation.x = 0.5 * (1 - attackCurve);
            }
        } else if (this.actionState === 'HIT') {
            this.parts.chest.rotation.x = -0.4;
            this.parts.head.rotation.x = 0.6;
            this.parts.arms.left.rotation.x = -1;
            this.parts.arms.right.rotation.x = -1;
        } else {
            // IDLE / MOVE
            if (this.isGrounded) {
                if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.z) > 0.1) {
                    // RUNNING
                    const runSpeed = 12;
                    const cycle = time * runSpeed;

                    this.parts.legs.left.rotation.x = Math.sin(cycle) * 0.8;
                    this.parts.legs.left.lower.rotation.x = Math.max(0, Math.sin(cycle + Math.PI / 2)) * 1.0;
                    this.parts.legs.right.rotation.x = Math.sin(cycle + Math.PI) * 0.8;
                    this.parts.legs.right.lower.rotation.x = Math.max(0, Math.sin(cycle + 3 * Math.PI / 2)) * 1.0;

                    this.parts.arms.left.rotation.x = Math.sin(cycle + Math.PI) * 0.8;
                    this.parts.arms.right.rotation.x = Math.sin(cycle) * 0.8;
                } else {
                    // KOF IDLE BOUNCE
                    const stanceBounce = Math.abs(Math.sin(time * 6)) * 0.1;
                    this.parts.chest.position.y = 3.6 - stanceBounce + breathing;

                    // Legs bend
                    const kneeBend = 0.3 + stanceBounce;
                    this.parts.legs.left.rotation.x = -kneeBend;
                    this.parts.legs.left.lower.rotation.x = kneeBend * 2;
                    this.parts.legs.right.rotation.x = -kneeBend;
                    this.parts.legs.right.lower.rotation.x = kneeBend * 2;

                    // Hands in guard
                    this.parts.arms.left.rotation.x = -0.8;
                    this.parts.arms.left.lower.rotation.x = -1.2;
                    this.parts.arms.right.rotation.x = -0.8;
                    this.parts.arms.right.lower.rotation.x = -1.2;
                }
            } else {
                // JUMP
                this.parts.legs.left.rotation.x = 0.4;
                this.parts.legs.right.rotation.x = -0.2;
                this.parts.arms.left.rotation.x = -2;
                this.parts.arms.right.rotation.x = -2;
            }
        }
    }
}
