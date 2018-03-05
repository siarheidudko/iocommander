var MD5=new function(){
  var l='length',
  h=[
   '0123456789abcdef',0x0F,0x80,0xFFFF,
    0x67452301,0xEFCDAB89,0x98BADCFE,0x10325476
  ],
  x=[
    [0,1,[7,12,17,22]],
    [1,5,[5, 9,14,20]],
    [5,3,[4,11,16,23]],
    [0,7,[6,10,15,21]]
  ],
  A=function(x,y,z){
    return(((x>>16)+(y>>16)+((z=(x&h[3])+(y&h[3]))>>16))<<16)|(z&h[3])
  },
  B=function(s){
    var n=((s[l]+8)>>6)+1,b=new Array(1+n*16).join('0').split('');
    for(var i=0;i<s[l];i++)b[i>>2]|=s.charCodeAt(i)<<((i%4)*8);
    return(b[i>>2]|=h[2]<<((i%4)*8),b[n*16-2]=s[l]*8,b)
  },
  R=function(n,c){return(n<<c)|(n>>>(32-c))},
  C=function(q,a,b,x,s,t){return A(R(A(A(a,q),A(x,t)),s),b)},
  F=function(a,b,c,d,x,s,t){return C((b&c)|((~b)&d),a,b,x,s,t)},
  G=function(a,b,c,d,x,s,t){return C((b&d)|(c&(~d)),a,b,x,s,t)},
  H=function(a,b,c,d,x,s,t){return C(b^c^d,a,b,x,s,t)},
  I=function(a,b,c,d,x,s,t){return C(c^(b|(~d)),a,b,x,s,t)},
  _=[F,G,H,I],
  S=(function(){
    with(Math)for(var i=0,a=[],x=pow(2,32);i<64;a[i]=floor(abs(sin(++i))*x));
    return a
  })(),
  X=function (n){
    for(var j=0,s='';j<4;j++)
      s+=h[0].charAt((n>>(j*8+4))&h[1])+h[0].charAt((n>>(j*8))&h[1]);
    return s
  };
  return function(s){
    var $=B(''+s),a=[0,1,2,3],b=[0,3,2,1],v=[h[4],h[5],h[6],h[7]];
    for(var i,j,k,N=0,J=0,o=[].concat(v);N<$[l];N+=16,o=[].concat(v),J=0){
      for(i=0;i<4;i++)
        for(j=0;j<4;j++)
          for(k=0;k<4;k++,a.unshift(a.pop()))
            v[b[k]]=_[i](
              v[a[0]],
              v[a[1]],
              v[a[2]],
              v[a[3]],
              $[N+(((j*4+k)*x[i][1]+x[i][0])%16)],
              x[i][2][k],
              S[J++]
            );
      for(i=0;i<4;i++)
        v[i]=A(v[i],o[i]);
    };return X(v[0])+X(v[1])+X(v[2])+X(v[3]);
}};