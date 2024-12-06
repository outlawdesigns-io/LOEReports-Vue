import { createStore } from 'vuex';
import autobahn from 'autobahn-browser';

const wampConn = new autobahn.Connection({
  url:'wss://api.outlawdesigns.io:9700/ws',
  realm:'realm1'
});
wampConn.onopen = (session) => {
  console.log('connected to wamp router!');
  // session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_PlaysAndAdditionsToDate',['mtd']).then(console.log);
}

wampConn.onclose = (reason,details) => {
  console.error('WAMP connection closed:',reason, details);
}


wampConn.open();

const state = {
  playedSongs:[],
  unplayedSongs:[],
  playsAndAdditions:[],
  statsByColumn:[],
  firstTimeAndAll:[]
};

const actions = {
  getPlayedSongs({commit},period){
    commit('clearPlayedSongs');
    wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_ToDate',[period]).then((queryResponse)=>{
      //apply some error checking about wamp response (maybe not registered) or sql query
      queryResponse[0].map((s)=>{
        commit('addPlayedSong',s);
      });
    }).catch((err)=>{
      console.log('wamp error caught...');
    });
  },
  getUnplayedSongs({commit}){
    commit('clearUnplayedSongs');
    wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_Unplayed').then((queryResponse)=>{
      queryResponse[0].map((s)=>{
        commit('addUnplayedSong',s);
      });
    }).catch((err)=>{
      //how to bubble up to component?
      console.log('wamp error caught...');
    });
  },
  getPlaysAndAdditions({commit},period){
    wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_PlaysAndAdditionsToDate',[period]).then((queryResponse)=>{
      commit('clearPlaysAndAdditions');
      queryResponse[0].map((e)=>{
        commit('addPlaysAndAdditions',e);
      });
    }).catch((err)=>{
      console.log(err);
      console.log('wamp error caught...');
    });
  },
  getStatsByColumn({commit},payload){
    wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_StatsByColumnToDate',payload).then((queryResponse)=>{
      commit('clearStatsByColumn');
      queryResponse[0].map((e)=>{
        commit('addStatsByColumn',e);
      });
    }).catch((err)=>{
      console.log(err);
      console.log('store error caught...');
    });
  },
  getFirstTimePlays({commit},period){
    wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_FirstTimeAndAllToDate',[period]).then((queryResponse)=>{
      queryResponse[0].map((e)=>{
        commit('setFirstTimePlays',e);
      });
    }).catch((err)=>{
      console.log('store error caught...');
    });
  }
};

const mutations = {
  addPlayedSong(state,s){
    state.playedSongs.push(s);
  },
  clearPlayedSongs(state){
    state.playedSongs = [];
  },
  addUnplayedSong(state,s){
    state.unplayedSongs.push(s);
  },
  clearUnplayedSongs(state){
    state.unplayedSongs = [];
  },
  clearPlaysAndAdditions(state){
    state.playsAndAdditions = [];
  },
  addPlaysAndAdditions(state,payload){
    state.playsAndAdditions.push(payload);
  },
  clearStatsByColumn(state){
    state.statsByColumn = [];
  },
  addStatsByColumn(state,payload){
    state.statsByColumn.push(payload);
  },
  setFirstTimePlays(state,payload){
    state.firstTimeAndAll = [];
    console.log(payload);
    state.firstTimeAndAll.push(payload);
  }
};

export default createStore({state,actions,mutations});