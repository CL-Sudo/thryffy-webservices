import { EventEmitter } from 'events';

export const authListener = new EventEmitter();

authListener.on('userSignUp', async user => {
  try {
    console.log('User sign up');
  } catch (e) {
    throw e;
  }
});
