function GalleryImage(author, path, name) {
    this.author = author;
    this.path = path;
    this.name = name;
    this.blobUrl = "";
}

function GalleryImgProvider(pAccessToken, pBaseFolder) {
    this.ACCESS_TOKEN = pAccessToken;
    this.BASE_FOLDER = pBaseFolder;
    this.galleryImages = new Array();
    this.galleryImagesCount = 0;
    this.currentImage = null;
    this.nextImageIndex = -1;
    this.nextImage = null;    
    this.reader = new FileReader();
    this.previousImageblobUrl = null;
    this.GetNextImage = function () {
        //console.debug("IMAGE PROVIDER GetNextImage");
        return new Promise((resolve, reject) => {

            if (this.nextImageIndex < this.galleryImagesCount - 1) {
                this.nextImageIndex += 1;
            } else {
                this.nextImageIndex = 0;
            }
            this.nextImage = this.galleryImages[this.nextImageIndex];

            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open('GET', this.nextImage.path, true);
            xmlHttp.responseType = "arraybuffer";
            xmlHttp.onload = function (response) {
                //This is revoking the URL in wrong times...
                //if(this.previousImageblobUrl)
                //    window.URL.revokeObjectURL(this.previousImageblobUrl);

                var imgSrc = window.URL.createObjectURL(new Blob([xmlHttp.response]));                
                //console.debug("AZURE: Image downloaded, stored at " + imgSrc);
                var img = $("#imageProviderDummy");
                img.attr("src", imgSrc);
                img.hide();

                localStorage[this.nextImage.Name] = imgSrc;
                this.previousImageblobUrl = this.nextImage.blobUrl;
                this.nextImage.blobUrl = imgSrc;
                resolve(this.nextImage);        
            }.bind(this);
            xmlHttp.send(null);
        });
    };

    this.listFoldersContinue = function () {
        //console.debug("IMAGEPROVIDER: Listing folders (continue)");
        return new Promise((resolve, reject) => {

            var url = "https://ischeidl.blob.core.windows.net/intergallery?restype=container&comp=list";

            var xhr = new XMLHttpRequest();
            //xhr.responseType = "json";
            xhr.open("GET", url);

            xhr.setRequestHeader("Accept", "*/*");
            xhr.setRequestHeader("Pragma", "no-cache");

            xhr.onload = function () {                
                var x2js = new X2JS();
                var jresponse = x2js.xml_str2json(xhr.response);
                var blobs = jresponse.EnumerationResults.Blobs.Blob;                
                resolve(blobs);
                //for (var i = 0, len = blobs.length; i < len; i++) {
                //    console.debug("BLOB: Name =>>" + blobs[i].Name);
                //    console.debug("BLOB: URL =>>>" + encodeURI(blobs[i].Url));
                //}

            };
            xhr.onerror = function (error) {
                console.error(error);
            };
            xhr.send();
        });
    };

    this.getAllImages = function (files) {
        //console.debug("IMAGEPROVIDER: Listing images from folders... Count: " + files.length);
        return new Promise((resolve, reject) => {
            this.galleryImages.length = 0;
            this.galleryImagesCount = 0;
            for (var i = 0; i < files.length; i++) {
                //Ignoring entries for folders
                if (files[i][".tag"] === "folder")
                    continue;

                //Assumes that author is in the folder name
                //Because of p1.bind, "this" will be scoped to the instance os GalleryImgProvider
                var author = files[i].Name.substring(0, files[i].Name.indexOf("/"));
                author = author.replaceAll("/" + files[i].Name, "");
                var galleryImg = new GalleryImage(author, files[i].Url, files[i].Name);
                this.galleryImages.push(galleryImg);
                this.galleryImagesCount += 1;
            }
            //console.debug("IMAGEPROVIDER: Shuffling images...");
            this.galleryImages = this.shuffle(this.galleryImages);
            //console.debug("IMAGEPROVIDER: Done downloading image metadata! Image count: " + this.galleryImagesCount);
            resolve();
        });
    }


    this.shuffle = function (array) {
        //Source:http://stackoverflow.com/a/2450976
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

}
String.prototype.replaceAll = function (strReplace, strWith) {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return this.replace(reg, strWith);
};

