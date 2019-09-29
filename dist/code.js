/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/code.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/code.ts":
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

figma.showUI(__html__, { width: 220, height: 228 });
let lastNodes = [];
let lastNode = null;
let selectedNodes = null;
let currentArtboard = figma.currentPage;
let notificationHandler = null;
figma.ui.onmessage = msg => {
    if (msg.type === 'create-metaball') {
        const nodes = figma.currentPage.selection;
        let selectedNodesInLastNodes = false;
        if (selectedNodes) {
            selectedNodesInLastNodes = nodes.every(n => selectedNodes.includes(n));
        }
        selectedNodes = nodes;
        if (figma.currentPage.selection.length < 2) {
            if (notificationHandler) {
                notificationHandler.cancel();
            }
            notificationHandler = figma.notify('Select more than one circle layer!', { timeout: 3 });
        }
        else {
            if (selectedNodesInLastNodes) {
                lastNodes.forEach(element => {
                    if (!element.removed) {
                        element.remove();
                    }
                });
            }
            lastNodes = [];
            let rate = msg.rate || 50;
            let handleSize = 24;
            let appearance = 'Half';
            let index = 1;
            for (let i = nodes.length - 1; i >= 1; i--) {
                for (let j = i - 1; j >= 0; j--) {
                    if (((nodes[i].type === 'ELLIPSE') && (nodes[i].width === nodes[i].height)) && ((nodes[j].type === 'ELLIPSE') && (nodes[j].width === nodes[j].height))) {
                        let metaballObj = metaball(nodes[i].width / 2, nodes[j].width / 2, [nodes[i].x + nodes[i].width / 2, nodes[i].y + nodes[i].width / 2], [nodes[j].x + nodes[j].width / 2, nodes[j].y + nodes[j].width / 2], handleSize / 10, rate / 100, appearance).replace(/,/g, ' ');
                        currentArtboard = nodes[i].parent;
                        if (metaballObj) {
                            let node = figma.createVector();
                            let layer = nodes[i];
                            node.vectorPaths = [{
                                    windingRule: 'EVENODD',
                                    data: metaballObj,
                                }];
                            lastNodes.push(node);
                            node.name = 'MetaballShape' + index;
                            node.fills = layer.fills;
                            node.strokes = layer.strokes;
                            node.strokeWeight = layer.strokeWeight;
                            node.strokeAlign = layer.strokeAlign;
                            currentArtboard.appendChild(node);
                            index++;
                        }
                        else {
                            figma.notify('Wrong distance');
                        }
                    }
                    else {
                        figma.notify('Selected layers are not circle layers!');
                    }
                }
            }
        }
    }
    else if (msg.type === 'union') {
        if ((lastNodes.length > 0) && (selectedNodes.length > 0)) {
            const booleanNode = figma.createBooleanOperation();
            selectedNodes.forEach(element => {
                if (!element.removed) {
                    booleanNode.appendChild(element);
                }
            });
            lastNodes.forEach(element => {
                if (!element.removed) {
                    booleanNode.appendChild(element);
                }
            });
            currentArtboard.appendChild(booleanNode);
        }
    }
    else {
        figma.closePlugin();
    }
};
/**
 * Based on Metaball script by SATO Hiroyuki
 * http://shspage.com/aijs/en/#metaball
 */
function metaball(radius1, radius2, center1, center2, handleSize = 2.4, v = 0.5, appearance = 'Full') {
    const HALF_PI = Math.PI / 2;
    const d = dist(center1, center2);
    const maxDist = radius1 + radius2 * 300;
    let u1, u2;
    if (radius1 === 0 || radius2 === 0 || d > maxDist || d <= Math.abs(radius1 - radius2)) {
        return '';
    }
    if (d < radius1 + radius2) {
        u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2) / (2 * radius1 * d));
        u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1) / (2 * radius2 * d));
    }
    else {
        u1 = 0;
        u2 = 0;
    }
    // All the angles
    const angleBetweenCenters = angle(center2, center1);
    const maxSpread = Math.acos((radius1 - radius2) / d);
    const angle1 = angleBetweenCenters + u1 + (maxSpread - u1) * v;
    const angle2 = angleBetweenCenters - u1 - (maxSpread - u1) * v;
    const angle3 = angleBetweenCenters + Math.PI - u2 - (Math.PI - u2 - maxSpread) * v;
    const angle4 = angleBetweenCenters - Math.PI + u2 + (Math.PI - u2 - maxSpread) * v;
    // Points
    const p1 = getVector(center1, angle1, radius1);
    const p2 = getVector(center1, angle2, radius1);
    const p3 = getVector(center2, angle3, radius2);
    const p4 = getVector(center2, angle4, radius2);
    // Define handle length by the
    // distance between both ends of the curve
    const totalRadius = radius1 + radius2;
    const d2Base = Math.min(v * handleSize, dist(p1, p3) / totalRadius);
    // Take into account when circles are overlapping
    const d2 = d2Base * Math.min(1, d * 2 / (radius1 + radius2));
    const r1 = radius1 * d2;
    const r2 = radius2 * d2;
    const h1 = getVector(p1, angle1 - HALF_PI, r1);
    const h2 = getVector(p2, angle2 + HALF_PI, r1);
    const h3 = getVector(p3, angle3 + HALF_PI, r2);
    const h4 = getVector(p4, angle4 - HALF_PI, r2);
    return metaballToPath(p1, p2, p3, p4, h1, h2, h3, h4, d > radius1, radius2, radius1, appearance);
}
function metaballToPath(p1, p2, p3, p4, h1, h2, h3, h4, escaped, r, r1, appearance) {
    if (appearance == 'Half') {
        return [
            'M', p1,
            'C', h1, h3, p3,
            'L', p4,
            'C', h4, h2, p2,
            'Z'
        ].join(' ');
    }
    else {
        return [
            'M', p1,
            'C', h1, h3, p3,
            'A', r, r, 0, escaped ? 1 : 0, 0, p4,
            'C', h4, h2, p2,
            'A', r1, r1, 0, escaped ? 1 : 0, 0, p1,
        ].join(' ');
    }
}
function dist([x1, y1], [x2, y2]) {
    return Math.pow((Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)), 0.5);
}
function angle([x1, y1], [x2, y2]) {
    return Math.atan2(y1 - y2, x1 - x2);
}
function getVector([cx, cy], a, r) {
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBLHdCQUF3QiwwQkFBMEI7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNGQUFzRixhQUFhO0FBQ25HO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxRQUFRO0FBQ2xELG1DQUFtQyxRQUFRO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2NvZGUudHNcIik7XG4iLCJmaWdtYS5zaG93VUkoX19odG1sX18sIHsgd2lkdGg6IDIyMCwgaGVpZ2h0OiAyMjggfSk7XG5sZXQgbGFzdE5vZGVzID0gW107XG5sZXQgbGFzdE5vZGUgPSBudWxsO1xubGV0IHNlbGVjdGVkTm9kZXMgPSBudWxsO1xubGV0IGN1cnJlbnRBcnRib2FyZCA9IGZpZ21hLmN1cnJlbnRQYWdlO1xubGV0IG5vdGlmaWNhdGlvbkhhbmRsZXIgPSBudWxsO1xuZmlnbWEudWkub25tZXNzYWdlID0gbXNnID0+IHtcbiAgICBpZiAobXNnLnR5cGUgPT09ICdjcmVhdGUtbWV0YWJhbGwnKSB7XG4gICAgICAgIGNvbnN0IG5vZGVzID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uO1xuICAgICAgICBsZXQgc2VsZWN0ZWROb2Rlc0luTGFzdE5vZGVzID0gZmFsc2U7XG4gICAgICAgIGlmIChzZWxlY3RlZE5vZGVzKSB7XG4gICAgICAgICAgICBzZWxlY3RlZE5vZGVzSW5MYXN0Tm9kZXMgPSBub2Rlcy5ldmVyeShuID0+IHNlbGVjdGVkTm9kZXMuaW5jbHVkZXMobikpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdGVkTm9kZXMgPSBub2RlcztcbiAgICAgICAgaWYgKGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbi5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uSGFuZGxlcikge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkhhbmRsZXIuY2FuY2VsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub3RpZmljYXRpb25IYW5kbGVyID0gZmlnbWEubm90aWZ5KCdTZWxlY3QgbW9yZSB0aGFuIG9uZSBjaXJjbGUgbGF5ZXIhJywgeyB0aW1lb3V0OiAzIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkTm9kZXNJbkxhc3ROb2Rlcykge1xuICAgICAgICAgICAgICAgIGxhc3ROb2Rlcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQucmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdE5vZGVzID0gW107XG4gICAgICAgICAgICBsZXQgcmF0ZSA9IG1zZy5yYXRlIHx8IDUwO1xuICAgICAgICAgICAgbGV0IGhhbmRsZVNpemUgPSAyNDtcbiAgICAgICAgICAgIGxldCBhcHBlYXJhbmNlID0gJ0hhbGYnO1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gMTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBub2Rlcy5sZW5ndGggLSAxOyBpID49IDE7IGktLSkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSBpIC0gMTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCgobm9kZXNbaV0udHlwZSA9PT0gJ0VMTElQU0UnKSAmJiAobm9kZXNbaV0ud2lkdGggPT09IG5vZGVzW2ldLmhlaWdodCkpICYmICgobm9kZXNbal0udHlwZSA9PT0gJ0VMTElQU0UnKSAmJiAobm9kZXNbal0ud2lkdGggPT09IG5vZGVzW2pdLmhlaWdodCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWV0YWJhbGxPYmogPSBtZXRhYmFsbChub2Rlc1tpXS53aWR0aCAvIDIsIG5vZGVzW2pdLndpZHRoIC8gMiwgW25vZGVzW2ldLnggKyBub2Rlc1tpXS53aWR0aCAvIDIsIG5vZGVzW2ldLnkgKyBub2Rlc1tpXS53aWR0aCAvIDJdLCBbbm9kZXNbal0ueCArIG5vZGVzW2pdLndpZHRoIC8gMiwgbm9kZXNbal0ueSArIG5vZGVzW2pdLndpZHRoIC8gMl0sIGhhbmRsZVNpemUgLyAxMCwgcmF0ZSAvIDEwMCwgYXBwZWFyYW5jZSkucmVwbGFjZSgvLC9nLCAnICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEFydGJvYXJkID0gbm9kZXNbaV0ucGFyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1ldGFiYWxsT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5vZGUgPSBmaWdtYS5jcmVhdGVWZWN0b3IoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGF5ZXIgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLnZlY3RvclBhdGhzID0gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRpbmdSdWxlOiAnRVZFTk9ERCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBtZXRhYmFsbE9iaixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdE5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5uYW1lID0gJ01ldGFiYWxsU2hhcGUnICsgaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5maWxscyA9IGxheWVyLmZpbGxzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc3Ryb2tlcyA9IGxheWVyLnN0cm9rZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zdHJva2VXZWlnaHQgPSBsYXllci5zdHJva2VXZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zdHJva2VBbGlnbiA9IGxheWVyLnN0cm9rZUFsaWduO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRBcnRib2FyZC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KCdXcm9uZyBkaXN0YW5jZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KCdTZWxlY3RlZCBsYXllcnMgYXJlIG5vdCBjaXJjbGUgbGF5ZXJzIScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG1zZy50eXBlID09PSAndW5pb24nKSB7XG4gICAgICAgIGlmICgobGFzdE5vZGVzLmxlbmd0aCA+IDApICYmIChzZWxlY3RlZE5vZGVzLmxlbmd0aCA+IDApKSB7XG4gICAgICAgICAgICBjb25zdCBib29sZWFuTm9kZSA9IGZpZ21hLmNyZWF0ZUJvb2xlYW5PcGVyYXRpb24oKTtcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZXMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQucmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgICAgICBib29sZWFuTm9kZS5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxhc3ROb2Rlcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvb2xlYW5Ob2RlLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY3VycmVudEFydGJvYXJkLmFwcGVuZENoaWxkKGJvb2xlYW5Ob2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICB9XG59O1xuLyoqXG4gKiBCYXNlZCBvbiBNZXRhYmFsbCBzY3JpcHQgYnkgU0FUTyBIaXJveXVraVxuICogaHR0cDovL3Noc3BhZ2UuY29tL2FpanMvZW4vI21ldGFiYWxsXG4gKi9cbmZ1bmN0aW9uIG1ldGFiYWxsKHJhZGl1czEsIHJhZGl1czIsIGNlbnRlcjEsIGNlbnRlcjIsIGhhbmRsZVNpemUgPSAyLjQsIHYgPSAwLjUsIGFwcGVhcmFuY2UgPSAnRnVsbCcpIHtcbiAgICBjb25zdCBIQUxGX1BJID0gTWF0aC5QSSAvIDI7XG4gICAgY29uc3QgZCA9IGRpc3QoY2VudGVyMSwgY2VudGVyMik7XG4gICAgY29uc3QgbWF4RGlzdCA9IHJhZGl1czEgKyByYWRpdXMyICogMzAwO1xuICAgIGxldCB1MSwgdTI7XG4gICAgaWYgKHJhZGl1czEgPT09IDAgfHwgcmFkaXVzMiA9PT0gMCB8fCBkID4gbWF4RGlzdCB8fCBkIDw9IE1hdGguYWJzKHJhZGl1czEgLSByYWRpdXMyKSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmIChkIDwgcmFkaXVzMSArIHJhZGl1czIpIHtcbiAgICAgICAgdTEgPSBNYXRoLmFjb3MoKHJhZGl1czEgKiByYWRpdXMxICsgZCAqIGQgLSByYWRpdXMyICogcmFkaXVzMikgLyAoMiAqIHJhZGl1czEgKiBkKSk7XG4gICAgICAgIHUyID0gTWF0aC5hY29zKChyYWRpdXMyICogcmFkaXVzMiArIGQgKiBkIC0gcmFkaXVzMSAqIHJhZGl1czEpIC8gKDIgKiByYWRpdXMyICogZCkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdTEgPSAwO1xuICAgICAgICB1MiA9IDA7XG4gICAgfVxuICAgIC8vIEFsbCB0aGUgYW5nbGVzXG4gICAgY29uc3QgYW5nbGVCZXR3ZWVuQ2VudGVycyA9IGFuZ2xlKGNlbnRlcjIsIGNlbnRlcjEpO1xuICAgIGNvbnN0IG1heFNwcmVhZCA9IE1hdGguYWNvcygocmFkaXVzMSAtIHJhZGl1czIpIC8gZCk7XG4gICAgY29uc3QgYW5nbGUxID0gYW5nbGVCZXR3ZWVuQ2VudGVycyArIHUxICsgKG1heFNwcmVhZCAtIHUxKSAqIHY7XG4gICAgY29uc3QgYW5nbGUyID0gYW5nbGVCZXR3ZWVuQ2VudGVycyAtIHUxIC0gKG1heFNwcmVhZCAtIHUxKSAqIHY7XG4gICAgY29uc3QgYW5nbGUzID0gYW5nbGVCZXR3ZWVuQ2VudGVycyArIE1hdGguUEkgLSB1MiAtIChNYXRoLlBJIC0gdTIgLSBtYXhTcHJlYWQpICogdjtcbiAgICBjb25zdCBhbmdsZTQgPSBhbmdsZUJldHdlZW5DZW50ZXJzIC0gTWF0aC5QSSArIHUyICsgKE1hdGguUEkgLSB1MiAtIG1heFNwcmVhZCkgKiB2O1xuICAgIC8vIFBvaW50c1xuICAgIGNvbnN0IHAxID0gZ2V0VmVjdG9yKGNlbnRlcjEsIGFuZ2xlMSwgcmFkaXVzMSk7XG4gICAgY29uc3QgcDIgPSBnZXRWZWN0b3IoY2VudGVyMSwgYW5nbGUyLCByYWRpdXMxKTtcbiAgICBjb25zdCBwMyA9IGdldFZlY3RvcihjZW50ZXIyLCBhbmdsZTMsIHJhZGl1czIpO1xuICAgIGNvbnN0IHA0ID0gZ2V0VmVjdG9yKGNlbnRlcjIsIGFuZ2xlNCwgcmFkaXVzMik7XG4gICAgLy8gRGVmaW5lIGhhbmRsZSBsZW5ndGggYnkgdGhlXG4gICAgLy8gZGlzdGFuY2UgYmV0d2VlbiBib3RoIGVuZHMgb2YgdGhlIGN1cnZlXG4gICAgY29uc3QgdG90YWxSYWRpdXMgPSByYWRpdXMxICsgcmFkaXVzMjtcbiAgICBjb25zdCBkMkJhc2UgPSBNYXRoLm1pbih2ICogaGFuZGxlU2l6ZSwgZGlzdChwMSwgcDMpIC8gdG90YWxSYWRpdXMpO1xuICAgIC8vIFRha2UgaW50byBhY2NvdW50IHdoZW4gY2lyY2xlcyBhcmUgb3ZlcmxhcHBpbmdcbiAgICBjb25zdCBkMiA9IGQyQmFzZSAqIE1hdGgubWluKDEsIGQgKiAyIC8gKHJhZGl1czEgKyByYWRpdXMyKSk7XG4gICAgY29uc3QgcjEgPSByYWRpdXMxICogZDI7XG4gICAgY29uc3QgcjIgPSByYWRpdXMyICogZDI7XG4gICAgY29uc3QgaDEgPSBnZXRWZWN0b3IocDEsIGFuZ2xlMSAtIEhBTEZfUEksIHIxKTtcbiAgICBjb25zdCBoMiA9IGdldFZlY3RvcihwMiwgYW5nbGUyICsgSEFMRl9QSSwgcjEpO1xuICAgIGNvbnN0IGgzID0gZ2V0VmVjdG9yKHAzLCBhbmdsZTMgKyBIQUxGX1BJLCByMik7XG4gICAgY29uc3QgaDQgPSBnZXRWZWN0b3IocDQsIGFuZ2xlNCAtIEhBTEZfUEksIHIyKTtcbiAgICByZXR1cm4gbWV0YWJhbGxUb1BhdGgocDEsIHAyLCBwMywgcDQsIGgxLCBoMiwgaDMsIGg0LCBkID4gcmFkaXVzMSwgcmFkaXVzMiwgcmFkaXVzMSwgYXBwZWFyYW5jZSk7XG59XG5mdW5jdGlvbiBtZXRhYmFsbFRvUGF0aChwMSwgcDIsIHAzLCBwNCwgaDEsIGgyLCBoMywgaDQsIGVzY2FwZWQsIHIsIHIxLCBhcHBlYXJhbmNlKSB7XG4gICAgaWYgKGFwcGVhcmFuY2UgPT0gJ0hhbGYnKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAnTScsIHAxLFxuICAgICAgICAgICAgJ0MnLCBoMSwgaDMsIHAzLFxuICAgICAgICAgICAgJ0wnLCBwNCxcbiAgICAgICAgICAgICdDJywgaDQsIGgyLCBwMixcbiAgICAgICAgICAgICdaJ1xuICAgICAgICBdLmpvaW4oJyAnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAnTScsIHAxLFxuICAgICAgICAgICAgJ0MnLCBoMSwgaDMsIHAzLFxuICAgICAgICAgICAgJ0EnLCByLCByLCAwLCBlc2NhcGVkID8gMSA6IDAsIDAsIHA0LFxuICAgICAgICAgICAgJ0MnLCBoNCwgaDIsIHAyLFxuICAgICAgICAgICAgJ0EnLCByMSwgcjEsIDAsIGVzY2FwZWQgPyAxIDogMCwgMCwgcDEsXG4gICAgICAgIF0uam9pbignICcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRpc3QoW3gxLCB5MV0sIFt4MiwgeTJdKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KChNYXRoLnBvdygoeDEgLSB4MiksIDIpICsgTWF0aC5wb3coKHkxIC0geTIpLCAyKSksIDAuNSk7XG59XG5mdW5jdGlvbiBhbmdsZShbeDEsIHkxXSwgW3gyLCB5Ml0pIHtcbiAgICByZXR1cm4gTWF0aC5hdGFuMih5MSAtIHkyLCB4MSAtIHgyKTtcbn1cbmZ1bmN0aW9uIGdldFZlY3RvcihbY3gsIGN5XSwgYSwgcikge1xuICAgIHJldHVybiBbY3ggKyByICogTWF0aC5jb3MoYSksIGN5ICsgciAqIE1hdGguc2luKGEpXTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=