export default{
  daysInLibrary(playedDateStr,createdDateStr){
    const diffInMs   = new Date(playedDateStr) - new Date(createdDateStr);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return Math.round(diffInDays);
  },
  generateColor(label){
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }
}
