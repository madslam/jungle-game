import {Modal} from 'antd';

function modalGame({redirect, title}) {
  let secondsToGo = 7;
  const modal = Modal.success ({
    title,
    content: `you will be redirect after ${secondsToGo} second.`,
  });
  const timer = setInterval (() => {
    secondsToGo -= 1;
    modal.update ({
      content: `you will be redirect after ${secondsToGo} second.`,
    });
  }, 1000);
  setTimeout (() => {
    clearInterval (timer);
    redirect ();
    modal.destroy ();
  }, secondsToGo * 1000);
}

export default modalGame;
