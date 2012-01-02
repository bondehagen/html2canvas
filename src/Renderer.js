/*
  html2canvas @VERSION@ <http://html2canvas.hertzen.com>
  Copyright (c) 2011 Niklas von Hertzen. All rights reserved.
  http://www.twitter.com/niklasvh

  Released under MIT License
*/
html2canvas.Renderer = function(parseQueue, opts){


    var options = {
        "width": null,
        "height": null,
        "renderer": "canvas"
    },
    queue = [],
    canvas,
    doc = document;
    
    options = html2canvas.Util.Extend(opts, options);


    
    function sortZ(zStack){
        var subStacks = [],
        stackValues = [],
        zStackChildren = zStack.children,
        s,
        i,
        stackLen,
        zValue,
        zLen,
        stackChild,
        b, 
        subStackLen;
        

        for (s = 0, zLen = zStackChildren.length; s < zLen; s+=1){
            
            stackChild = zStackChildren[s];
            
            if (stackChild.children && stackChild.children.length > 0){
                subStacks.push(stackChild);
                stackValues.push(stackChild.zindex);
            }else{         
                queue.push(stackChild);
            }  
           
        }
      
        stackValues.sort(function(a, b) {
            return a - b;
        });
    
        for (i = 0, stackLen = stackValues.length; i < stackLen; i+=1){
            zValue = stackValues[i];
            for (b = 0, subStackLen = subStacks.length; b <= subStackLen; b+=1){
                
                if (subStacks[b].zindex === zValue){
                    stackChild = subStacks.splice(b, 1);
                    sortZ(stackChild[0]);
                    break;
                  
                }
            }        
        }
  
    }

    function canvasRenderer(zStack){
        function clipRoundedRect(ctx, x, y, borderInfo, width, height, clipType) {

            var lineWidth = borderInfo.borders[0].width;

            if (clipType == 'stroke') {
                width += lineWidth * 2;
                height += lineWidth * 2;
            }

            var calcRadius = function(value) {
                value = parseInt(value);
                switch (clipType) {
                    case 'fill':
                        return Math.abs(value - parseInt((value > 0 ) ? lineWidth : 0));
                    case 'stroke':
                        return Math.abs(value + parseInt((value > 0 ) ? lineWidth / 2 : 0));
                    default:
                        return Math.abs(value);
                }
            };

            var r = borderInfo.radius;
            var tla = calcRadius(r.top.left.h);
            var tlb = calcRadius(r.top.left.v);
            var tra = calcRadius(r.top.right.h);
            var trb = calcRadius(r.top.right.v);
            var bla = calcRadius(r.bottom.left.h);
            var blb = calcRadius(r.bottom.left.v);
            var bra = calcRadius(r.bottom.right.h);
            var brb = calcRadius(r.bottom.right.v);

            var topWidth = width - tra;
            var rightHeight = height - brb;
            var bottomWidth = width - bra;
            var leftHeight = height - blb;

            ctx.beginPath();
            ctx.moveTo(x + tla / 4, y + tlb / 4);
            ctx.quadraticCurveTo(x + tla / 2, y, x + tla, y);
            ctx.lineTo(x + topWidth, y);
            ctx.quadraticCurveTo(x + topWidth + tra / 2, y, x + topWidth + tra - tra / 4, y + trb / 4);
            ctx.quadraticCurveTo(x + topWidth + tra, y + trb / 2, x + topWidth + tra, y + trb);
            ctx.lineTo(x + bottomWidth + bra, y + rightHeight);
            ctx.quadraticCurveTo(x + bottomWidth + bra, y + rightHeight + (brb / 2), x + bottomWidth + bra - bra / 4, y + rightHeight + (brb - brb / 4));
            ctx.quadraticCurveTo(x + bottomWidth + bra / 2, y + rightHeight + brb, x + bottomWidth, y + rightHeight + brb);
            ctx.lineTo(x + bla, y + leftHeight + blb);
            ctx.quadraticCurveTo(x + bla / 2, y + leftHeight + blb, x + bla / 4, y + leftHeight + blb - blb / 4);
            ctx.quadraticCurveTo(x, y + leftHeight + blb / 2, x, y + leftHeight);
            ctx.lineTo(x, y + tlb);
            ctx.quadraticCurveTo(x, y + tlb / 2, x + tla / 4, y + tlb / 4);
            ctx.closePath();
            ctx.clip();
        }

        function strokeRoundedRect(ctx, x, y, borderInfo, width, height) {
            var borders = borderInfo.borders;

            // Draw sides
            for (var side = 0; side < 4; side++) {

                var border = borders[side];
                var bounds = border.bounds;

                if (border.color != 'none' && typeof bounds !== "undefined") {

                    var horizontal = bounds[2] > bounds[3],
                        bigSide = bounds[-~!horizontal + 1],
                        smallSide = bounds[-~horizontal + 1],
                        bx = bounds[0],
                        by = bounds[1],
                        bw = bounds[2],
                        bh = bounds[3];

                    // clip the border side
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(bx + [0, bw, borders[3].width, 0][side], by);
                    ctx.lineTo(bx + bw - (side == 2 && borders[1].width || 0), by + [0, bh, 0, borders[0].width][side]);
                    ctx.lineTo(bx + [bw - borders[1].width + 1, 0, bw + 1, bw][side], by + [border.width, bh - borders[2].width, bh, bh - borders[2].width][side]);
                    ctx.lineTo(bx + (!side && borders[3].width || 0), by + (side == 1 ? borders[0].width : bh));
                    ctx.clip();

                    ctx.fillStyle = border.color;
                    ctx.lineWidth = 0;

                    switch (border.style) {
                        case 'dashed':
                            var dashSize = smallSide * 2;
                            var amount = Math.ceil((bigSide / dashSize) / 2);
                            if (amount % 2 != 0)
                                amount += 1

                            var space = dashSize + (bigSide - (amount * dashSize)) / (amount - 1);
                            for (var i = 0; i <= amount * space; i += space) {
                                ctx.beginPath();
                                if (horizontal)
                                    ctx.fillRect(bx + i, by, dashSize, smallSide);
                                else
                                    ctx.fillRect(bx, by + i, smallSide, dashSize);
                            }
                            break;
                        case 'dotted':
                            var cache = Math.PI * 2;
                            var radius = smallSide / 2;
                            var dotSize = smallSide;
                            var amount = Math.ceil((bigSide / dotSize) / 2);
                            if (amount % 2 != 0)
                                amount += 1

                            var space = dotSize + (bigSide - (amount * (radius * 2))) / (amount - 1);
                            for (var i = radius; i <= amount * space; i += space) {
                                ctx.beginPath();
                                if (horizontal)
                                    ctx.arc(bx + i, by + radius, radius, 0, cache, true);
                                else
                                    ctx.arc(bx + radius, by + i, radius, 0, cache, true);
                                ctx.fill();
                            }
                            break;
                        case 'double':
                            var size = smallSide / 3,
                                dSize = size * 2;
                            !horizontal && (bw = size) && (size = bh);
                            ctx.beginPath();
                            ctx.fillRect(bx, by, bw, size);
                            ctx.fillRect(bx + (!horizontal * dSize), by + (horizontal * dSize), bw, size);
                            break;
                        case 'solid':
                            ctx.beginPath();
                            ctx.fillRect.apply(ctx, bounds);
                            break;
                        case 'groove':
                        case 'ridge':
                        case 'inset':
                        case 'outset':
                        case 'hidden':
                        case 'none':
                        default:
                            break;
                    }

                    ctx.restore();
                }
            }


            // Draw corners
            var r = borderInfo.radius;
            var tlh = parseInt(r.top.left.h);
            var tlv = parseInt(r.top.left.v);
            var trh = parseInt(r.top.right.h);
            var trv = parseInt(r.top.right.v);
            var blh = parseInt(r.bottom.left.h);
            var blv = parseInt(r.bottom.left.v);
            var brv = parseInt(r.bottom.right.v);
            var brh = parseInt(r.bottom.right.h);

            var topWidth = width - trh + borders[0].width;
            var rightHeight = height - brv + borders[1].width;
            var bottomWidth = width - brh + borders[2].width;
            var leftHeight = height - blv + borders[3].width;

            // top
            if (tlh > 0 || tlv > 0 || trh > 0 || trv > 0) {
                ctx.strokeStyle = borders[0].color;
                ctx.lineWidth = borders[0].width;
                ctx.beginPath();
                ctx.moveTo(x + tlh / 4, y + tlv / 4);
                ctx.quadraticCurveTo(x + tlh / 2, y, (x + tlh), y);
                ctx.moveTo(x + topWidth, y);
                ctx.quadraticCurveTo(x + topWidth + trh / 2, y, x + topWidth + trh - trh / 4, y + trv / 4);
                ctx.stroke();
            }

            // right
            if (brh > 0 || brv > 0 || trh > 0 || trv > 0) {
                ctx.strokeStyle = borders[1].color;
                ctx.lineWidth = borders[1].width;
                ctx.beginPath();
                ctx.moveTo(x + topWidth + trh - trh / 4, y + trv / 4);
                ctx.quadraticCurveTo(x + topWidth + trh, y + trv / 2, x + topWidth + trh, y + trv);
                ctx.moveTo(x + bottomWidth + brh, y + rightHeight);
                ctx.quadraticCurveTo(x + bottomWidth + brh, y + rightHeight + (brv / 2), x + bottomWidth + brh - brh / 4, y + rightHeight + (brv - brv / 4));
                ctx.stroke();
            }

            // bottom
            if (brh > 0 || brv > 0 || blh > 0 || blv > 0) {
                ctx.strokeStyle = borders[2].color;
                ctx.lineWidth = borders[2].width;
                ctx.beginPath();
                ctx.moveTo(x + bottomWidth + brh - brh / 4, y + rightHeight + (brv - brv / 4));
                ctx.quadraticCurveTo(x + bottomWidth + brh / 2, y + rightHeight + brv, x + bottomWidth, y + rightHeight + brv);
                ctx.moveTo(x + blh, y + leftHeight + blv);
                ctx.quadraticCurveTo(x + blh / 2, y + leftHeight + blv, x + blh / 4, y + leftHeight + blv - blv / 4);
                ctx.stroke();
            }

            // left
            if (blh > 0 || blv > 0 || tlh > 0 || tlv > 0) {
                ctx.strokeStyle = borders[3].color;
                ctx.lineWidth = borders[3].width;
                ctx.beginPath();
                ctx.moveTo(x + blh / 4, y + leftHeight + blv - blv / 4);
                ctx.quadraticCurveTo(x, y + leftHeight + blv / 2, x, y + leftHeight);
                ctx.moveTo(x, y + tlv);
                ctx.quadraticCurveTo(x, y + tlv / 2, x + tlh / 4, y + tlv / 4);
                ctx.stroke();
            }
        }
        sortZ(zStack.zIndex);
        

        var ctx = canvas.getContext("2d"),
        storageContext,
        i,
        queueLen,
        a,
        storageLen,
        renderItem,
        fstyle;
      
        canvas.width = options.width || zStack.ctx.width;   
        canvas.height = options.height || zStack.ctx.height;
    
        fstyle = ctx.fillStyle;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = fstyle;

        for (i = 0, queueLen = queue.length; i < queueLen; i+=1){
            
            storageContext = queue.splice(0, 1)[0];
            storageContext.canvasPosition = storageContext.canvasPosition || {};   

            //this.canvasRenderContext(storageContext,parentctx);           

            // set common settings for canvas
            ctx.textBaseline = "bottom";
   
            if (storageContext.clip){
                ctx.save();
                ctx.beginPath();
                ctx.rect(storageContext.clip.left, storageContext.clip.top, storageContext.clip.width, storageContext.clip.height);
                ctx.clip();
            }

            if (storageContext.ctx.storage){
               
                for (a = 0, storageLen = storageContext.ctx.storage.length; a < storageLen; a+=1){
                    
                    renderItem = storageContext.ctx.storage[a];
                    switch(renderItem.type){
                        case "variable":
                            ctx[renderItem.name] = renderItem['arguments'];
                            break;
                        case "function":
                            if (renderItem.name === "startClip") {
                                ctx.save();
                                if(renderItem['arguments'][4])
                                    clipRoundedRect(ctx,
                                        renderItem['arguments'][0],
                                        renderItem['arguments'][1],
                                        renderItem['arguments'][2],
                                        renderItem['arguments'][3],
                                        renderItem['arguments'][4],
                                        renderItem['arguments'][5]);
                            } else if (renderItem.name === "stopClip") {
                                ctx.restore();
                            } else if (renderItem.name === "drawBorders") {
                                strokeRoundedRect(ctx,
                                    renderItem['arguments'][0],
                                    renderItem['arguments'][1],
                                    renderItem['arguments'][2],
                                    renderItem['arguments'][3],
                                    renderItem['arguments'][4]);
                            } else if (renderItem.name === "fillRect") {
                                ctx.fillRect(
                                    renderItem['arguments'][0],
                                    renderItem['arguments'][1],
                                    renderItem['arguments'][2],
                                    renderItem['arguments'][3]);
                            } else if(renderItem.name === "fillText") {
                                ctx.fillText(renderItem['arguments'][0],renderItem['arguments'][1],renderItem['arguments'][2]);
                            } else if(renderItem.name === "drawImage") {
                                if (renderItem['arguments'][8] > 0 && renderItem['arguments'][7]){
                                    ctx.drawImage(
                                        renderItem['arguments'][0],
                                        renderItem['arguments'][1],
                                        renderItem['arguments'][2],
                                        renderItem['arguments'][3],
                                        renderItem['arguments'][4],
                                        renderItem['arguments'][5],
                                        renderItem['arguments'][6],
                                        renderItem['arguments'][7],
                                        renderItem['arguments'][8]);
                                }      
                            }

                            break;
                        default:
                    }
                }
            }  
            if (storageContext.clip){
                ctx.restore();
            }
        }
        html2canvas.log("html2canvas: Renderer: Canvas renderer done - returning canvas obj");
        
        // this.canvasRenderStorage(queue,this.ctx);
        return canvas;
    }

    function svgRenderer(zStack){
        sortZ(zStack.zIndex);
        
        var svgNS = "http://www.w3.org/2000/svg",
        svg = doc.createElementNS(svgNS, "svg"),
        xlinkNS = "http://www.w3.org/1999/xlink",
        defs = doc.createElementNS(svgNS, "defs"),
        i,
        a,
        queueLen,
        storageLen,
        storageContext,
        renderItem,
        el,
        settings = {},
        text,
        fontStyle,
        clipId = 0;
        
        svg.setAttribute("version", "1.1");
        svg.setAttribute("baseProfile", "full");

        svg.setAttribute("viewBox", "0 0 " + Math.max(zStack.ctx.width, options.width) + " " + Math.max(zStack.ctx.height, options.height));
        svg.setAttribute("width", Math.max(zStack.ctx.width, options.width) + "px");
        svg.setAttribute("height", Math.max(zStack.ctx.height, options.height) + "px");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.appendChild(defs);
        
        
        
        for (i = 0, queueLen = queue.length; i < queueLen; i+=1){
            
            storageContext = queue.splice(0, 1)[0];
            storageContext.canvasPosition = storageContext.canvasPosition || {};   
           
            //this.canvasRenderContext(storageContext,parentctx);           

   
            /*
            if (storageContext.clip){
                ctx.save();
                ctx.beginPath();
                // console.log(storageContext);
                ctx.rect(storageContext.clip.left, storageContext.clip.top, storageContext.clip.width, storageContext.clip.height);
                ctx.clip();
        
            }*/
        
            if (storageContext.ctx.storage){
               
                for (a = 0, storageLen = storageContext.ctx.storage.length; a < storageLen; a+=1){
                    
                    renderItem = storageContext.ctx.storage[a];
                    
                   
                    
                    switch(renderItem.type){
                        case "variable":
                            settings[renderItem.name] = renderItem['arguments'];              
                            break;
                        case "function":
                            if (renderItem.name === "fillRect") {
                                
                                el = doc.createElementNS(svgNS, "rect");
                                el.setAttribute("x", renderItem['arguments'][0]);
                                el.setAttribute("y", renderItem['arguments'][1]);
                                el.setAttribute("width", renderItem['arguments'][2]);
                                el.setAttribute("height", renderItem['arguments'][3]);
                                el.setAttribute("fill",  settings.fillStyle);
                                svg.appendChild(el);

                            } else if(renderItem.name === "fillText") {
                                el = doc.createElementNS(svgNS, "text");
                                
                                fontStyle = settings.font.split(" ");
                                
                                el.style.fontVariant = fontStyle.splice(0, 1)[0];
                                el.style.fontWeight = fontStyle.splice(0, 1)[0];
                                el.style.fontStyle = fontStyle.splice(0, 1)[0];
                                el.style.fontSize = fontStyle.splice(0, 1)[0];
                                
                                el.setAttribute("x", renderItem['arguments'][1]);                 
                                el.setAttribute("y", renderItem['arguments'][2] - (parseInt(el.style.fontSize, 10) + 3));
                                
                                el.setAttribute("fill", settings.fillStyle);
                                
                               
                             
                                
                                // TODO get proper baseline
                                el.style.dominantBaseline = "text-before-edge";
                                el.style.fontFamily = fontStyle.join(" ");

                                text = doc.createTextNode(renderItem['arguments'][0]);
                                el.appendChild(text);
                               
                                
                                svg.appendChild(el);
                                
              
                    
                            } else if(renderItem.name === "drawImage") {

                                if (renderItem['arguments'][8] > 0 && renderItem['arguments'][7]){
                                    
                                    // TODO check whether even any clipping is necessary for this particular image
                                    el = doc.createElementNS(svgNS, "clipPath");
                                    el.setAttribute("id", "clipId" + clipId); 
                                    
                                    text = doc.createElementNS(svgNS, "rect");
                                    text.setAttribute("x",  renderItem['arguments'][5] );                 
                                    text.setAttribute("y", renderItem['arguments'][6]);
                                    
                                    text.setAttribute("width", renderItem['arguments'][3]);                 
                                    text.setAttribute("height", renderItem['arguments'][4]);
                                    el.appendChild(text);
                                    defs.appendChild(el);
                                    
                                    el = doc.createElementNS(svgNS, "image");
                                    el.setAttributeNS(xlinkNS, "xlink:href", renderItem['arguments'][0].src);
                                    el.setAttribute("width", renderItem['arguments'][0].width);                 
                                    el.setAttribute("height", renderItem['arguments'][0].height);           
                                    el.setAttribute("x", renderItem['arguments'][5] - renderItem['arguments'][1]);                 
                                    el.setAttribute("y", renderItem['arguments'][6] - renderItem['arguments'][2]);
                                    el.setAttribute("clip-path", "url(#clipId" + clipId + ")");
                                    // el.setAttribute("xlink:href", );
                                    

                                    el.setAttribute("preserveAspectRatio", "none");
                                    
                                    svg.appendChild(el);
                                    
                                    
                                    clipId += 1; 
                                /*
                                    ctx.drawImage(
                                        renderItem['arguments'][0],
                                        renderItem['arguments'][1],
                                        renderItem['arguments'][2],
                                        renderItem['arguments'][3],
                                        renderItem['arguments'][4],
                                        renderItem['arguments'][5],
                                        renderItem['arguments'][6],
                                        renderItem['arguments'][7],
                                        renderItem['arguments'][8]
                                        );
                                        */
                                }      
                            }
                               
                       
  
                            break;
                        default:
                               
                    }
            
                }

            }  
        /*
            if (storageContext.clip){
                ctx.restore();
            }
    */

       
   
        }
        
        
        
        
        
        
        
        
        
        
        html2canvas.log("html2canvas: Renderer: SVG Renderer done - returning SVG DOM obj");
        
        return svg;

    }

    
    //this.each(this.opts.renderOrder.split(" "),function(i,renderer){
        
    //options.renderer = "svg";
    
    switch(options.renderer.toLowerCase()){
        case "canvas":
            canvas = doc.createElement('canvas');
            if (canvas.getContext){
                this.log("html2canvas: Renderer: using canvas renderer");
                return canvasRenderer(parseQueue);
            }               
            break;
        case "svg":
            if (doc.createElementNS){
                this.log("html2canvas: Renderer: using SVG renderer");
                return svgRenderer(parseQueue);             
            }
            break;
            
    }
         
         
         
    //});

    return this;
     

    
};


