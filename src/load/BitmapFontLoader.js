/**
 * @class BitmapFontLoader
 * @param url
 * @constructor
 */
alex.load.BitmapFontLoader = function (url, resolution) {
    alex.utils.EventDispatcher.call(this);
    this.url = url;
    this.resolution = resolution;
};
alex.load.BitmapFontLoader.prototype = Object.create(alex.utils.EventDispatcher.prototype);
alex.load.BitmapFontLoader.prototype.constructor = alex.load.BitmapFontLoader;

/**
 * begin loading the font xml file
 */
alex.load.BitmapFontLoader.prototype.load = function () {
    this.ajaxRequest = new PIXI.AjaxRequest();
    var self = this;
    this.ajaxRequest.onreadystatechange = function () {
        self.onXMLLoaded();
    };
    this.jsonData = null;
    this.ajaxRequest.open("GET", this.url, true);
    if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/xml");
    this.ajaxRequest.send(null)
};

/**
 * if xml loaded succesfully then load the font image
 * @method onXMLLoaded
 */
alex.load.BitmapFontLoader.prototype.onXMLLoaded = function () {
    if (this.ajaxRequest.readyState === 4) {
        if (this.ajaxRequest.status === 200) {
            //get the response xml
            var responseXML = this.ajaxRequest.responseXML;
            if (!responseXML || /MSIE 9/i.test(navigator.userAgent) || navigator.isCocoonJS) {
                if (typeof(window.DOMParser) === 'function') {
                    var domparser = new DOMParser();
                    responseXML = domparser.parseFromString(this.ajaxRequest.responseText, 'text/xml');
                } else {
                    var div = document.createElement('div');
                    div.innerHTML = this.ajaxRequest.responseText;
                    responseXML = div;
                }
            }
            //load the font image
            this.loadFontImage(responseXML);
        } else if (this.ajaxRequest.status === 404 || this.ajaxRequest.status === 0) {
            this.emit({type: "error", data: null, name: null});
        }
    }
};

/**
 * @method loadFontImage
 * @param responseXML
 */
alex.load.BitmapFontLoader.prototype.loadFontImage = function (responseXML) {
    //get the file name
    var imageFile = responseXML.getElementsByTagName('page')[0].getAttribute('file');
    var slashIndex = this.url.lastIndexOf('/');
    var folderURL = this.url.substr(0, slashIndex + 1);
    //concat the folder path
    var textureUrl = folderURL + imageFile;
    //check if image exists
    var texture = PIXI.utils.TextureCache[textureUrl];
    if (texture) {
        this.parseFontData(responseXML, texture);
    } else {
        //load the image!
        var img = new Image(),
            self = this;
        img.onload = function () {
            //create image
            var baseTexture = alex.load.ImageLoadState.prototype.createBaseTexture(img, textureUrl);
            texture = new PIXI.Texture(baseTexture);
            PIXI.utils.TextureCache[textureUrl] = texture;
            self.parseFontData(responseXML, texture)
        };
        img.src = textureUrl;
    }
};

/**
 * copied from pixi code
 * @method parseFontData
 * @param responseXML
 * @param texture
 * @returns {{}}
 */
alex.load.BitmapFontLoader.prototype.parseFontData = function (responseXML, texture) {
    var data = {};
    var info = responseXML.getElementsByTagName('info')[0];
    var common = responseXML.getElementsByTagName('common')[0];

    data.font = info.getAttribute('face');
    data.size = parseInt(info.getAttribute('size'), 10);
    data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
    data.chars = {};
    data.baseTexture = texture.baseTexture;

    //parse letters
    var letters = responseXML.getElementsByTagName('char');
    var letter = null;

    for (var i = 0; i < letters.length; i++) {
        letter = letters[i];
        var charCode = parseInt(letter.getAttribute('id'), 10);

        var textureRect = new PIXI.Rectangle(
            this.scaleValue(parseInt(letter.getAttribute('x'), 10) + texture.frame.x),
            this.scaleValue(parseInt(letter.getAttribute('y'), 10) + texture.frame.y),
            this.scaleValue(parseInt(letter.getAttribute('width'), 10)),
            this.scaleValue(parseInt(letter.getAttribute('height'), 10))
        );

        data.chars[charCode] = {
            xOffset: this.scaleValue(parseInt(letter.getAttribute('xoffset'), 10)),
            yOffset: this.scaleValue(parseInt(letter.getAttribute('yoffset'), 10)),
            xAdvance: this.scaleValue(parseInt(letter.getAttribute('xadvance'), 10)),
            kerning: {},
            texture: new PIXI.Texture(texture.baseTexture, textureRect)

        };
    }

    //parse kernings
    var kernings = responseXML.getElementsByTagName('kerning');
    for (i = 0; i < kernings.length; i++) {
        var first = this.scaleValue(parseInt(kernings[i].getAttribute('first'), 10));
        var second = this.scaleValue(parseInt(kernings[i].getAttribute('second'), 10));
        var amount = this.scaleValue(parseInt(kernings[i].getAttribute('amount'), 10));

        data.chars[second].kerning[first] = amount;
    }

    // store it in pixi fonts
    PIXI.extras.BitmapText.fonts[data.font] = data;

    this.emit({
        name: data.font,
        data: data,
        type: 'loaded'
    });
    return data;
};

/**
 *
 * @param value
 * @returns {number}
 */
alex.load.BitmapFontLoader.prototype.scaleValue = function (value) {
    return value / this.resolution;
};