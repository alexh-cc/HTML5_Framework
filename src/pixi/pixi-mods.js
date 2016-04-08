// *************************************************************
//add missing method to display object
// *************************************************************
PIXI.DisplayObject.prototype.removeFromParent = function () {
    if (this.parent) this.parent.removeChild(this);
};
PIXI.Container.prototype.contains = function (child) {
    return this.children.indexOf(child) > -1;
};

/**
 * add resolution handling to BitmapText, also numLines
 */
PIXI.extras.BitmapText.prototype.updateText = function () {
    var data = PIXI.extras.BitmapText.fonts[this._font.name];
    var pos = new PIXI.Point();
    var prevCharCode = null;
    var chars = [];
    var lastLineWidth = 0;
    var maxLineWidth = 0;
    var lineWidths = [];
    var line = 0;
    //Added this reference to resolution (AH)
    var scale = (this._font.size / data.size) * data.baseTexture.resolution;
    var lastSpace = -1;
    var maxLineHeight = 0;

    for (var i = 0; i < this.text.length; i++) {
        var charCode = this.text.charCodeAt(i);
        lastSpace = /(\s)/.test(this.text.charAt(i)) ? i : lastSpace;

        if (/(?:\r\n|\r|\n)/.test(this.text.charAt(i))) {
            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }

        if (lastSpace !== -1 && this.maxWidth > 0 && pos.x * scale > this.maxWidth) {
            PIXI.utils.removeItems(chars, lastSpace, i - lastSpace);
            i = lastSpace;
            lastSpace = -1;

            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
            line++;

            pos.x = 0;
            pos.y += data.lineHeight;
            prevCharCode = null;
            continue;
        }

        var charData = data.chars[charCode];

        if (!charData) {
            continue;
        }

        if (prevCharCode && charData.kerning[prevCharCode]) {
            pos.x += charData.kerning[prevCharCode];
        }

        chars.push({
            texture: charData.texture,
            line: line,
            charCode: charCode,
            position: new PIXI.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)
        });
        lastLineWidth = pos.x + (charData.texture.width + charData.xOffset);
        pos.x += charData.xAdvance;
        maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
        prevCharCode = charCode;
    }

    lineWidths.push(lastLineWidth);
    maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
    //Added this
    this.numLines = (line + 1);//<--- added this (AH)

    var lineAlignOffsets = [];

    for (i = 0; i <= line; i++) {
        var alignOffset = 0;

        if (this._font.align === 'right') {
            alignOffset = maxLineWidth - lineWidths[i];
        }
        else if (this._font.align === 'center') {
            alignOffset = (maxLineWidth - lineWidths[i]) / 2;
        }

        lineAlignOffsets.push(alignOffset);
    }

    var lenChars = chars.length;
    var tint = this.tint;

    for (i = 0; i < lenChars; i++) {
        var c = this._glyphs[i]; // get the next glyph sprite

        if (c) {
            c.texture = chars[i].texture;
        }
        else {
            c = new PIXI.Sprite(chars[i].texture);
            this._glyphs.push(c);
        }

        c.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
        c.position.y = chars[i].position.y * scale;
        c.scale.x = c.scale.y = scale;
        c.tint = tint;

        if (!c.parent) {
            this.addChild(c);
        }
    }

    // remove unnecessary children.
    for (i = lenChars; i < this._glyphs.length; ++i) {
        this.removeChild(this._glyphs[i]);
    }

    this.textWidth = maxLineWidth * scale;
    this.textHeight = (pos.y + data.lineHeight) * scale;
    this.maxLineHeight = maxLineHeight * scale;
};

/**
 * Grabs an interaction data object from the internal pool
 *
 * @param touchEvent {EventData} The touch event we need to pair with an interactionData object
 *
 * @private
 */
PIXI.interaction.InteractionManager.prototype.getTouchData = function (touchEvent){
    var touchData = this.interactiveDataPool.pop();
    if(!touchData) {
        touchData = new PIXI.interaction.InteractionData();
    }
    touchData.identifier = touchEvent.identifier;
    this.mapPositionToPoint( touchData.global, touchEvent.clientX, touchEvent.clientY );
    if(navigator.isCocoonJS){
        touchData.global.x = touchData.global.x / this.resolution;
        touchData.global.y = touchData.global.y / this.resolution;
    }
    touchEvent.globalX = touchData.global.x;
    touchEvent.globalY = touchData.global.y;

    //added this line!
    touchData.originalTouch = touchEvent;
    return touchData;
};

// *************************************************************
// add 'numLines' to wrapped text
// *************************************************************
//PIXI.Text.prototype.numLines = 1;
//PIXI.Text.prototype.wordWrap = function(text){
//    this.numLines = 1;
//    // Greedy wrapping algorithm that will wrap words as the line grows longer
//    // than its horizontal bounds.
//    var result = '';
//    var lines = text.split('\n');
//    for (var i = 0; i < lines.length; i++)
//    {
//        var spaceLeft = this.style.wordWrapWidth;
//        var words = lines[i].split(' ');
//        for (var j = 0; j < words.length; j++)
//        {
//            var wordWidth = this.context.measureText(words[j]).width;
//            var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
//            if(j === 0 || wordWidthWithSpace > spaceLeft)
//            {
//                // Skip printing the newline if it's the first word of the line that is
//                // greater than the word wrap width.
//                if(j > 0)
//                {
//                    result += '\n';
//                    this.numLines++;
//                }
//                result += words[j];
//                spaceLeft = this.style.wordWrapWidth - wordWidth;
//            }
//            else
//            {
//                spaceLeft -= wordWidthWithSpace;
//                result += ' ' + words[j];
//            }
//        }
//
//        if (i < lines.length-1)
//        {
//            result += '\n';
//            this.numLines++;
//        }
//    }
//    return result;
//};