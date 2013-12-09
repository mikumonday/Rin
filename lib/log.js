module.exports = function(msg) {
  d = new Date();
  d1 = d.getHours();
  d2 = d.getMinutes();
  d3 = d.getSeconds();
  d4 = d.getMilliseconds();
  if(d1 < 10){
    d1= "0" + d1;
  }
  if(d2 < 10){
    d2= "0" + d2;
  }
  if(d3 < 10){
    d3= "0" + d3;
  }
  if (d4 < 100) {
    d4= "0" + d4;
    if(d4 < 10) {
      d4= "0" + d4;
    }
  }
  console.log("[" + d1 + ":" + d2 + ":" + d3 + ":" + d4 + '] ' + msg);
};