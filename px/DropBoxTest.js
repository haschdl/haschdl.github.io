/// <reference path="galleryimgprovider.js" />


var provider;

$(function () {
    // Handler for .ready() called.
    provider = new GalleryImgProvider();
    provider.ACCESS_TOKEN = document.getElementById('access-token').value;
    provider.BASE_FOLDER = "/apps/Interactive Gallery/";
    $('#dropboximg').hide();
});




function formSubmit() {
    provider.listFolders()
    .then((cursor) => provider.listFoldersContinue(cursor))
    .then((files) => provider.getAllImages(files))
    .then(() => displayFiles(provider.galleryImages));
}


function displayFiles(galleryImages) {
    var filesList = document.getElementById('files');
    $('#files').empty();
    var li;
    for (var i = 0; i < galleryImages.length; i++) {

        var imgOb = galleryImages[i];
        li = document.createElement('li');
        li.appendChild(document.createTextNode(imgOb.name + " (" + imgOb.author + ")"));
        $(li).click({
            galleryImage: imgOb
        }, DropBoxDownloadImage);
        filesList.appendChild(li);
    }
}

function DropBoxDownloadImage(event) {
    var dbx = new Dropbox({
        accessToken: provider.ACCESS_TOKEN
    });
    //More info: http://dropbox.github.io/dropbox-sdk-js/global.html#FilesDownloadArg
    dbx.filesDownload({
        path: event.data.galleryImage.path
    }).then(function (data) {
        var downloadUrl = URL.createObjectURL(data.fileBlob);
        var img = $('#dropboximg');
        img.attr('src', downloadUrl);
        img.show();
    }).catch(function (error) {
        console.error(error);
    });
    return false;
}