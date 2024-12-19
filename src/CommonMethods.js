export default{
  daysInLibrary(playedDateStr,createdDateStr){
    const diffInMs   = new Date(playedDateStr) - new Date(createdDateStr);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return Math.round(diffInDays);
  },
  generateColor(label){
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  },
  reduceRatio(numerator,denominator){
    let gcd = (a,b)=>{
      return b ? gcd(b, a%b) : a;
    }
    gcd = gcd(numerator,denominator);
    return [numerator/gcd, denominator/gcd];
  },
  reduceFirstTimePlays(acc,e){
    return e.isFirstTimePlay == 1 ? ++acc:acc;
  },
  reduceReplays(acc,e){
    return e.isFirstTimePlay == 0 ? ++acc:acc;
  }
}
