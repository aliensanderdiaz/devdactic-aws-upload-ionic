import { Component } from '@angular/core';
import { Camera, CameraSource, ImageOptions } from '@capacitor/camera';
import { CameraResultType } from '@capacitor/camera/dist/esm/definitions';
import { ActionSheetController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { AwsService } from '../aws.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  images: any[] = [];
  edit = false

  constructor(
    public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private awsProvider: AwsService,
    private actionSheetCtrl: ActionSheetController,
    // private file: File,
    // private camera: Camera
  ) {}

  ionViewWillEnter() {
    // this.loadImages();
  }

  loadImages() {
    this.images = [];
    this.awsProvider.getFileList().subscribe((files) => {
      for (let name of files) {
        this.awsProvider.getSignedFileRequest(name).subscribe((res) => {
          this.images.push({ key: name, url: res });
        });
      }
    });
  }

  async presentActionSheet() {
    let actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          },
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  takePicture(sourceType: CameraSource) {
    // Create options for the Camera Dialog
    const options: ImageOptions = {
      quality: 100,
      correctOrientation: true,
      // destinationType: this.camera.DestinationType.FILE_URI,
      // encodingType: this.camera.EncodingType.JPEG,
      // mediaType: this.camera.MediaType.PICTURE,
      resultType: CameraResultType.Uri,
      source: sourceType,
    };

    // Get the picture
    Camera.getPhoto(options).then(
      async (imageData: any) => {
        let loading = await this.loadingCtrl.create();
        loading.present();

        console.log({ imageData })

        // // Resolve the picture URI to a file
        // this.file.resolveLocalFilesystemUrl(imageData).then(
        //   (oneFile) => {
        //     // Convert the File to an ArrayBuffer for upload
        //     this.file
        //       .readAsArrayBuffer(this.file.tempDirectory, oneFile.name)
        //       .then((realFile) => {
        //         let type = 'jpg';
        //         let newName =
        //           this.awsProvider.randomString(6) +
        //           new Date().getTime() +
        //           '.' +
        //           type;

        //         // Get the URL for our PUT request
        //         this.awsProvider
        //           .getSignedUploadRequest(newName, 'image/jpeg')
        //           .subscribe((data) => {
        //             let reqUrl = data.signedRequest;

        //             // Finally upload the file (arrayBuffer) to AWS
        //             this.awsProvider
        //               .uploadFile(reqUrl, realFile)
        //               .subscribe((result) => {
        //                 // Add the resolved URL of the file to our local array
        //                 this.awsProvider
        //                   .getSignedFileRequest(newName)
        //                   .subscribe((res) => {
        //                     this.images.push({ key: newName, url: res });
        //                     loading.dismiss();
        //                   });
        //               });
        //           });
        //       });
        //   },
        //   (err: any) => {
        //     console.log('err: ', err);
        //   }
        // );
      },
      (err) => {
        console.log('err: ', err);
      }
    );
  }

  deleteImage(index: number) {
    let toRemove = this.images.splice(index, 1);
    this.awsProvider.deleteFile(toRemove[0]['key']).subscribe(async (res) => {
      let toast = await this.toastCtrl.create({
        message: res['msg'],
        duration: 2000,
      });
      await toast.present();
    });
  }
}
