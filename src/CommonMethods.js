export default{
  newPlayedSongHandler(store,args){
    console.log(args);
    store.commit('updateSongLists',args);
  },
  generateColor(label){
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }
}
