// src/app/config/ckeditor-config.ts

import { SpecialCharacters } from '@ckeditor/ckeditor5-special-characters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';

export const CKEditorConfig = {
  plugins: [
    SpecialCharacters,
    SpecialCharactersEssentials,
    // Adicione outros plugins que você esteja utilizando
  ],
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'link',
    'specialCharacters', // Adiciona o botão de caracteres especiais à toolbar
    'bulletedList',
    'numberedList',
    '|',
    'imageUpload',
    'blockQuote',
    'insertTable',
    'mediaEmbed',
    '|',
    'undo',
    'redo',
  ],
};
