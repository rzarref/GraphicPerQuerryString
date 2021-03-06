      var jsonData=[];
      var urlVars;

      // Read a page's GET URL variables and return them as an associative array.
      function getUrlVars()
      {
          var vars = [], hash;
          var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
          for(var i = 0; i < hashes.length; i++)
          {
              hash = hashes[i].split('=');
              vars.push(hash[0]);
              vars[hash[0]] = hash[1];
          }
          return vars;
      }

      //função do javascript que é chamada no carregamento da página
      window.onload = function () {


      // Dado este ponto de conexão informado na plataforma:
      // http://api.demo.konkerlabs.net:443/sub/fsoh2687ru3m/{canal}
      // Fiz um roteamento na plataforma e o canal de saida que configurei é /out
      // O usuário deste gerado pela plataforma foi: fsoh2687ru3m
      // A senha gerada foi: SENHA_DO_DEVICE
      // Então a chamada GET pode ser feita da seguinte forma:
      /*
      $.ajax({
          url: "http://fsoh2687ru3m:SENHA_DO_DEVICE@api.demo.konkerlabs.net/sub/fsoh2687ru3m/out",
          type: 'GET',
          dataType: 'jsonp',
          success:function(data) {
          }
      });*/

      ///
      //AQUI NESTE EXEMEPLO FIZ UMA FUNÇÃO EM QUE PLOTA UM GRÁFICO QUE SE ATUALIZA SOZINHO
      //Valores a serem passados para esta função:
      //variáveis de configuração de conexão com a plataforma KONKER
      //e configuração do gráfico a ser plotado
      //http://api.demo.konkerlabs.net:80/sub/qsvsjr79epn9/out
      var refreshInterval=1000; //de quanto em quanto tempo o ajax deve consultar novamente a plataforma em milissegundos

      urlVars=getUrlVars();
      var auxURL=decodeURIComponent(urlVars["urlsub"]);

      var slashes=auxURL.lastIndexOf("//");



      //ALTERE AQUI COM SEUS DADOS
      var API_URI=auxURL.substr(slashes+2,auxURL.indexOf("/",slashes+2)-(slashes+2));//"api.demo.konkerlabs.net";//domínio do servidor api da konker<<<TROQUE PELO DOMÍNIO QUE VOCÊ USA
      var API_USER=urlVars["user"];//"qobjmtbnne6d";//usuário do device <<<TROQUE PELO SEU DEVICE
      var API_PASS=urlVars["senha"];//AQNfbO2Zljdl";//senha do device<<<TROQUE PELO SEU DEVICE

      var API_CHANNEL=auxURL.substr(auxURL.lastIndexOf("/")+1,auxURL.length);//"saida";//canal de subscrição

      //'2012.08.10 12:00:00'
      var chart_PerioInicial=decodeURIComponent(urlVars["ini"]);//"2017.03.09 15:10:00"; //unidade mostrada no tooltip
      var chart_PerioFinal=decodeURIComponent(urlVars["fim"]);//"0"; //unidade mostrada no tooltip



      var chart_bindToId="graf-temp";//id da <div> em que o gráfico será plotado
      var chart_XData="meta[timestamp]";//item do json correspondente aos dados do eixo X
      var chart_XLabel="Tempo";//nome do eixo X
      var chart_YData="data["+ urlVars["dado"] +"]";//item do json correspondente aos dados do eixo Y
      var chart_YLabel=urlVars["dado"];//nome do eixo Y
      var chart_LineName=urlVars["dado"];//nome da linha plotada
      var chart_Xformat=decodeURIComponent(urlVars["formato"]);//"%H:%M:%S";//"%Y-%m-%d %H:%M:%S"; //formato dos dados do eixo X

      var chart_TooltipUnit=decodeURIComponent(urlVars["unidade"]); //unidade mostrada no tooltip


      document.getElementById("titulo-label").innerHTML=urlVars["dado"];


      //função que plota um gráfico de linha no tempo
      plotKonkerTimeseriesChart(refreshInterval,
        API_URI,
        API_USER,
        API_PASS,
        API_CHANNEL,
        chart_PerioInicial,
        chart_PerioFinal,
        chart_bindToId,
        chart_XData,
        chart_XLabel,
        chart_YData,
        chart_YLabel,
        chart_LineName,
        chart_TooltipUnit,
        chart_Xformat)



    }



  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  /// IMPLEMENTAÇÃO DA FUNÇÃO DE PLOTAGEM

    function plotKonkerTimeseriesChart(refreshInterval,
                            API_URI,
                            API_USER,
                            API_PASS,
                            API_CHANNEL,
                            chart_PerioInicial,
                            chart_PerioFinal,
                            chart_bindToId,
                            chart_XData,
                            chart_XLabel,
                            chart_YData,
                            chart_YLabel,
                            chart_LineName,
                            chart_TooltipUnit,
                            chart_Xformat) {
      var lastUpdate=0;
      var chart;
      var plotedPoints=0;

      //***

      var lastUpdateOffset=0;

      var startDate;
      var endDate;
      if(chart_PerioInicial == null){
        chart_PerioInicial="01/01/2015"
        startDate=new Date(chart_PerioInicial);// * 1000
      }else{
        startDate=new Date(chart_PerioInicial.replace("_"," "));// * 1000
      }

      if(chart_PerioFinal == null){
        chart_PerioFinal=new Date();
        endDate= new Date(chart_PerioFinal);// * 1000
      }else{
        endDate= new Date(chart_PerioFinal.replace("_"," "));// * 1000
      }

      if (isNaN(startDate)){
        startDate=new Date("01/01/2015");// * 1000
      }else
      if(isNaN(endDate) || startDate>=endDate){
       endDate= new Date();
      }


    getSegundosAntes(startDate);



    function continuousUpdate(){
      //***
      //3o Chamada ciclica para a plataforma. A repetição é dada por refreshInterval
      setInterval(function(){
          $.ajax({

            url: "http://" + API_USER +  ":" + API_PASS +"@" + API_URI+ "/sub/" + API_USER +"/" + API_CHANNEL,
            type: 'GET',
            dataType: 'jsonp',
            success:function(data) {

              plotNewData(data,0);
              lastUpdate= data[data.length-1].meta.timestamp;

            }
        })
      }, refreshInterval);

    }


    function getHistory(segundosAntes){
      getLastUpdate(function(lastUpd) {
        var Offset=lastUpd - (segundosAntes * 1000);
        plotOffsetPoints(Offset, getSegundosantes);
      });
    }

    function getSegundosAntes(timeReference) {
      getLastUpdate(function(lastUpd) {
        var segundosAntes=(lastUpd - timeReference)/ 1000;
        if  (segundosAntes>=0){
          var Offset=lastUpd - (segundosAntes * 1000);
          plotOffsetPoints(Offset, getSegundosAntes);
        }
      });
    }


    function plotOffsetPoints(Offset, callback) {
      console.log("http://" + API_USER + ":" + API_PASS+ "@" + API_URI + "/sub/" + API_USER + "/" + API_CHANNEL + "?offset="+ String(Offset));
      //faço um subscribe com offset de (lastUpdate - secondsOffset)
      return $.ajax({
          url: "http://" + API_USER + ":" + API_PASS+ "@" + API_URI + "/sub/" + API_USER + "/" + API_CHANNEL + "?offset="+ String(Offset),
          dataType: 'jsonp',
          success:function(data) {
            //if (data.length==0)return;
            var endPeriod=false;
            if(data.length==0){
              return;
            }
            if(data[data.length-1].meta.timestamp>endDate){
              for (var i=0;i < data.length; i++){
                  if (data[i].meta.timestamp>endDate){
                    data=data.splice(i, data.length-i);
                    endPeriod=true;
                    break;
                  }
              }
            }


            if(plotedPoints==0){
              if (data.length>0){
                initChart(data);
                if (endPeriod==false){
                  callback(data[data.length-1].meta.timestamp);
                }
              }
            }else{
            //  if (data.length>0){
                plotNewData(data,0);
                if (endPeriod==false){
                  callback(data[data.length-1].meta.timestamp);
                }
              //}
            }

          }
      });


    }



      function getLastUpdate(callback) {
        $.ajax({
            url: "http://" + API_USER + ":" + API_PASS+ "@" + API_URI + "/sub/" + API_USER + "/" + API_CHANNEL,
            type: 'GET',
            dataType: 'jsonp',
            success:function(data) {
              jsonData=data;
              lastUpd=data[0].meta.timestamp;
              callback(lastUpd);
            }
        });
      }




      //PLOTAR UMA LINHA NO TEMPO DE UM ARRAY JSON
      function initChart(jsonarray) {
        plotedPoints=plotedPoints+jsonarray.length;
        //c3.js é uma biblioteca para plotar gráficos
        //veja a documentação do C3 em http://c3js.org/reference.html e exemplos em http://c3js.org/examples.html
        chart = c3.generate({
          transition: {
             //duration: 200//tempo do efeito especial na hora de mostrar o gráfico
          },
          bindto: "#" + chart_bindToId,//indica qual o ID da div em que o gráfico deve ser desenhado
          zoom: {
            enabled: true //permite ou não o zoom no gráfico
          },
          point: {
            show: false//mostra ou esconde as bolinhas na linha do gráfico
          },

          data: {
            json:jsonarray,// dados json a serem plotados

            keys: {
              x: chart_XData,//item do json correspondente ao eixo X
              value: [chart_YData] ,//item do json correspondente ao eixo Y
            },
            names: {
              [chart_YData]: chart_LineName//nome da linha plotada
            }
            ,
            colors: {
                [chart_YData]: '#E30613'//cor da linha
            }

          },
          axis: {
            x: {
              type : 'timeseries',//tipo do gráfico a ser plotado
              tick: {
                format: chart_Xformat,//formato dos dados no eixo X
                rotate: 45//rotação do texto dos dados no eixo X
              },
              label: {
                text: chart_XLabel,//nome do eixo X
                position: 'inner-middle'//posição do nome do eixo X
              }

            },

            y: {
              label: {
                text: chart_YLabel,//nome do eixo Y
                position: 'outer-middle'//posição do nome do eixo Y
              }
            }
          },

          tooltip: {
            show: true,
             format: {
               value: function (value, ratio, id, index) { return value + " " + chart_TooltipUnit; }
             }
          }
        });
      }



      //passar size=0 para não limitar o numero de pontos máximos para plotar
      function plotNewData(jsonarray, size){
        //só plota se o timestamp do ultimo dado retornado for diferente
        if (jsonarray[0].meta.timestamp >lastUpdate) {
          plotedPoints=plotedPoints+jsonarray.length;
          var len;
          if(size>0){
            if(plotedPoints>size){
              len=1;
            }else{
              len=0;
            }
          }else{
            len=0;
          }

          //flow é uma função do c3.js que adiciona pontos novos a um gráfico já existente
          chart.flow({
            json:jsonarray,
                keys: {
                  x: chart_XData, //dados do eixo X
                  value: [chart_YData] ,//dados do eixo Y
                },
                length:len //indica que a cada ponto novo, o mais antigo deve ser descartado
            ,duration: 100//tempo do efeito especial na hora de mostrar o gráfico
          });

        }
        //CÓDIGO NECESSÁRIO PARA ATUALIZAR O GRÁFICO
        //chart.refresh();
      }




    }
