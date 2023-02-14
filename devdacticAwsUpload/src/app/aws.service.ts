import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AwsService {
  apiUrl = 'http://127.0.0.1:5000/';

  constructor(public http: HttpClient) {}

  getSignedUploadRequest(name: string, type: string) {
    return this.http
      .get(`${this.apiUrl}aws/sign?file-name=${name}&file-type=${type}`)
      .pipe(map((res: any) => res.json()));
  }

  getFileList(): Observable<Array<any>> {
    return this.http.get(`${this.apiUrl}aws/files`).pipe(
      map((res: any) => res.json()),
      map((res: any) => {
        return res['Contents'].map((val: any) => val.Key);
      })
    );
  }

  getSignedFileRequest(name: string) {
    return this.http
      .get(`${this.apiUrl}aws/files/${name}`)
      .pipe(map((res: any) => res.json()));
  }

  deleteFile(name: any) {
    return this.http
      .delete(`${this.apiUrl}aws/files/${name}`)
      .pipe(map((res: any) => res.json()));
  }

  // https://www.thepolyglotdeveloper.com/2015/03/create-a-random-nonce-string-using-javascript/
  randomString = function (length: number) {
    var text = '';
    var possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  uploadFile(url: string, file: any) {
    return this.http.put(url, file);
  }
}
