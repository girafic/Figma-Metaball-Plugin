// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
let lastNodes = [];
let lastNode:VectorNode = null;
let selectedNodes = null;
let currentArtboard: BaseNode & ChildrenMixin | null  = figma.currentPage;

figma.ui.onmessage = msg => {
  if (msg.type === 'create-metaball') {
      const nodes = figma.currentPage.selection
      selectedNodes = nodes;

      if (figma.currentPage.selection.length < 2) {
          figma.closePlugin('Select 2 circle layers!');
      } else {
          lastNodes.forEach( element => {
            element.remove();
          });
          lastNodes = [];
          let rate:number = msg.rate || 50;
          let handleSize:number = msg.handleSize || 24;
          let appearance:string = 'Half';

          let arr = new Array();
          let isCircleArr = new Array();
          
          let index = 1;
          for (let i = nodes.length - 1; i >= 1; i--) {
            for (let j = i - 1; j >= 0; j--) {
              if (((nodes[i].type === 'ELLIPSE') && (nodes[i].width === nodes[i].height)) && ((nodes[j].type === 'ELLIPSE') && (nodes[j].width === nodes[j].height))) {
                let metaballObj = metaball(nodes[i].width / 2, nodes[j].width / 2, [nodes[i].x + nodes[i].width / 2, nodes[i].y + nodes[i].width / 2], [nodes[j].x + nodes[j].width / 2, nodes[j].y + nodes[j].width / 2], handleSize/10, rate/100, appearance).replace(/,/g, ' ');
                currentArtboard = nodes[i].parent;
                if (metaballObj) {
                  let node = figma.createVector();
                  let layer: any = nodes[i];
                  node.vectorPaths = [{
                      windingRule: 'EVENODD',
                      data: metaballObj,
                  }];
                  lastNodes.push(node);
                  node.name = 'MetaballShape'+ index;
                  node.fills = layer.fills;
                  node.strokes = layer.strokes;
                  currentArtboard.appendChild(node);
                  index++;
                } else {
                  figma.closePlugin('Wrong distance');
                }
              } else {
                figma.closePlugin('Selected layers are not circle objects!');
              }
            }
          }
          
          /*nodes.forEach(element => {
            booleanNode.appendChild(element);
          });
          lastNodes.forEach(element => {
            booleanNode.appendChild(element);
          });*/
          //currentArtboard.appendChild(booleanNode);

        /*
          nodes.forEach((layer: EllipseNode) => {
              let radius = layer.width / 2;
              let centerx1 = layer.x + radius;
              let centerx2 = layer.y + radius;
              let layerFills = layer.fills;
              let layerStrokes = layer.strokes;

              currentArtboard = layer.parent;
              
              arr.push({radius, centerx1, centerx2, layerFills, layerStrokes});
              if ((layer.type === 'ELLIPSE') && (layer.width === layer.height)) {
                  isCircleArr.push(true);
              } else {
                  isCircleArr.push(false);
              };
          });
          if (isCircleArr.every(element => {return element === true})) {
              let metaballObj = metaball(arr[0].radius, arr[1].radius, [arr[0].centerx1, arr[0].centerx2], [arr[1].centerx1, arr[1].centerx2], handleSize/10, rate/100, appearance).replace(/,/g, ' ');
              
              if (metaballObj) {
                  if (lastNode) {
                      lastNode.remove();
                  }
                  const node = figma.createVector();

                  node.vectorPaths = [{
                      windingRule: 'EVENODD',
                      data: metaballObj,
                  }];
                  lastNode = node;
                  node.name = 'Metaball';
                  node.fills = arr[0].layerFills;
                  node.strokes = arr[0].layerStrokes;
                  currentArtboard.appendChild(node);
              } else {
                  figma.closePlugin('Wrong distance');
              }
             
          } else {
              figma.closePlugin('Selected layers are not circle objects!');
          }
           */
  
  
  
      }        
  } else if (msg.type === 'cancel') {
      if (lastNodes.length > 0 && selectedNodes.length > 0) {
        const booleanNode = figma.createBooleanOperation();
        selectedNodes.forEach(element => {
          booleanNode.appendChild(element);
        });
        lastNodes.forEach(element => {
          booleanNode.appendChild(element);
        });
        
        currentArtboard.appendChild(booleanNode);
      }
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
    u1 = Math.acos(
      (radius1 * radius1 + d * d - radius2 * radius2) / (2 * radius1 * d),
    );
    u2 = Math.acos(
      (radius2 * radius2 + d * d - radius1 * radius1) / (2 * radius2 * d),
    );
  } else {
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
  const p1: Array<number> = getVector(center1, angle1, radius1);
  const p2: Array<number> = getVector(center1, angle2, radius1);
  const p3: Array<number> = getVector(center2, angle3, radius2);
  const p4: Array<number> = getVector(center2, angle4, radius2);

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

  return metaballToPath(
    p1, p2, p3, p4,
    h1, h2, h3, h4,
    d > radius1,
    radius2,
    radius1,
    appearance
  );
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
  } else {
    return [
      'M', p1,
      'C', h1, h3, p3,
      'A', r, r, 0, escaped ? 1 : 0, 0, p4,
      'C', h4, h2, p2,
      'A', r1, r1, 0, escaped ? 1 : 0, 0, p1,
    ].join(' ');
  }
}

function dist([x1, y1]:Array<number>, [x2, y2]:Array<number>) {
  return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}

function angle([x1, y1]:Array<number>, [x2, y2]:Array<number>) {
  return Math.atan2(y1 - y2, x1 - x2);
}

function getVector([cx, cy]:Array<number>, a, r) {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}