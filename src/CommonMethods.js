export default{
  Music:{
    reduceLength(acc,e){
      if(e.length == null){
        acc.nullCount = (acc.nullCount ?? 0) + 1;
      }else{
        acc.milliseconds = (acc.milliseconds ?? 0) + parseInt(e.length);
      }
      return acc;
    }
  },
  daysInLibrary(playedDateStr,createdDateStr){
    const diffInMs = new Date(playedDateStr) - new Date(createdDateStr);
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
  },
  buildTimeStr(ms){
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60 )).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24 )).toFixed(1);
    if (seconds < 60) return `${seconds} Sec`;
    else if (minutes < 60) return `${minutes} Min`;
    else if (hours < 24) return `${hours} Hrs`
    else return `${days} Days`;
  },
  groupCreatedDate(acc,e){
    const date = new Date(e.created_date).toISOString().split('T')[0];
    if(acc[date]){
      acc[date]++
    }else{
      acc[date] = 1;
    }
    return acc;
  }
  // isSameDay(dateStr1,dateStr2){
  //   const date1 = new Date(dateStr1);
  //   const date2 = new Date(dateStr2);
  //   return (
  //     date1.getFullYear() === date2.getFullYear() &&
  //     date1.getMonth() === date2.getMonth() &&
  //     date1.getDate() === date2.getDate()
  //   );
  // },
  // isSameHour(dateStr1,dateStr2){
  //   const date1 = new Date(dateStr1);
  //   const date2 = new Date(dateStr2);
  //   return (
  //     date1.getFullYear() === date2.getFullYear() &&
  //     date1.getMonth() === date2.getMonth() &&
  //     date1.getDate() === date2.getDate() &&
  //     date1.getHours() === date2getHours()
  //   );
  // }
}
