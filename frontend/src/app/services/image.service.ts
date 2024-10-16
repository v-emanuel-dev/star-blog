import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private serverUrl: string = 'http://localhost:3000'; // Substitua pela URL do seu servidor Node.js
  private profilePicSubject = new BehaviorSubject<string | null>(null);
  profilePic$ = this.profilePicSubject.asObservable();

  constructor() {
    console.log('UserService initialized.');
    this.initialize();
  }

  initialize() {
    console.log('UserService initialize called.');
    this.checkLocalStorageProfilePic();
  }

  private checkLocalStorageProfilePic() {
    const storedPic = localStorage.getItem('profilePicture');
    if (storedPic) {
      console.log('Found profile picture in localStorage:', storedPic);
      this.setProfilePic(storedPic);
    } else {
      console.log(
        'No profile picture found in localStorage. Setting up watcher.'
      );
      this.watchForProfilePicInLocalStorage();
    }
  }

  private watchForProfilePicInLocalStorage() {
    const intervalId = setInterval(() => {
      const storedPic = localStorage.getItem('profilePicture');
      if (storedPic) {
        console.log('Profile picture found during watch:', storedPic);
        this.setProfilePic(storedPic);
        clearInterval(intervalId);
      }
    }, 1000); // Verifica a cada 1 segundo
  }

  setProfilePic(picUrl: string) {
    const fullUrl = this.getFullProfilePicUrl(picUrl);
    console.log('Setting profile picture:', fullUrl);
    localStorage.setItem('profilePicture', picUrl); // Armazenar o valor original no localStorage
    this.profilePicSubject.next(fullUrl); // Atualizar o BehaviorSubject com a URL completa
  }

  updateProfilePic(picUrl: string): void {
    console.log('Updating profile picture in ImageService:', picUrl);
    this.setProfilePic(picUrl);
  }

  getFullProfilePicUrl(picUrl: string): string {
    // Substitui as barras invertidas por barras normais
    picUrl = picUrl.replace(/\\/g, '/');
    return picUrl.startsWith('http')
      ? picUrl
      : `http://localhost:3000/${picUrl}`;
  }

  clearProfilePic(): void {
    console.log('Clearing profile picture in UserService.');
    this.profilePicSubject.next(null);
  }
}
