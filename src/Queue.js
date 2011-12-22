/*
  html2canvas @VERSION@ <http://html2canvas.hertzen.com>
  Copyright (c) 2011 Niklas von Hertzen. All rights reserved.
  http://www.twitter.com/niklasvh

  Released under MIT License
*/
html2canvas.canvasContext = function (width, height) {
    this.storage = [];
    this.width = width;
    this.height = height;
    //this.zIndex;

    this.drawBorders = function(){
        this.storage.push(
        {
            type: "function",
            name: "drawBorders",
            'arguments': arguments
        });
    };

    this.startClip = function(){
        this.storage.push(
        {
            type: "function",
            name: "startClip",
            'arguments': arguments
        });
    };

    this.stopClip = function(){
        this.storage.push(
        {
            type: "function",
            name: "stopClip"
        });
    };

    this.fillRect = function(){
        this.storage.push(
        {
            type: "function",
            name: "fillRect",
            'arguments': arguments            
        });
    };
    
       
    this.drawImage = function () {     
        this.storage.push(
        {
            type: "function",
            name: "drawImage",
            'arguments': arguments            
        });
    };
    
    
    this.fillText = function () {
        
        this.storage.push(
        {
            type: "function",
            name: "fillText",
            'arguments': arguments            
        });      
    };  
    
    
    this.setVariable = function(variable, value) {
            this.storage.push(
            {
                type: "variable",
                name: variable,
                'arguments': value            
            });
    };
    
    return this;
    
};