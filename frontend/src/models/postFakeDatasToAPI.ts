import axios from 'axios'
import { namesList } from './names'

function makeid(length: number = 10) {
  var result           = '';
  var characters       = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function createUsers(count: number) {
  let i = 0;
  while (i < count) {
    let name: string = namesList[Math.floor(Math.random() * (namesList.length - 1))]
    const headers = {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    };
    const payload: object = Object({
      username : name,
      password : makeid(21),
      email    : name + "@exemple.com",
    })
    console.log(payload);

    axios.post('/api/users/', payload, { headers })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    })
    i++;
  }
}
