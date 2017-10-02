function generateFramesArray(amount, frameName) {
  const framesArr = [];
  for(let i = 0; i < amount; i++) {
    framesArr.push(`${frameName}_${i}`);
  }

  return framesArr;
}

export default generateFramesArray;
