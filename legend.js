function drawLegend(legendSelector, legendColorScale) {
    // credit: Prof.Rz
    const offsets = { width: 15,
                      top: 2,
                      bottom: 24 };

    const stepSize = 4;
    const minMaxExtendPercent = 0;


    const legend = d3.select(legendSelector);
    const legendHeight = legend.attr("height");
    const legendBarWidth = legend.attr("width") - (offsets.width * 2);
    const legendMinMax = d3.extent(legendColorScale.domain());

    const minMaxExtension = (legendMinMax[1] - legendMinMax[0]) * minMaxExtendPercent;
    const barHeight = legendHeight - offsets.top - offsets.bottom;

    let barScale = d3.scaleLinear().domain([legendMinMax[0]-minMaxExtension,
                                              legendMinMax[1]+minMaxExtension])
                                  .range([0,legendBarWidth]);
    let barAxis = d3.axisBottom(barScale);

    let bar = legend.append("g")
                    .attr("class", "legend colorbar")
                    .attr("transform", `translate(${offsets.width},${offsets.top})`)

    if (legendColorScale.hasOwnProperty('thresholds') || legendColorScale.hasOwnProperty('quantiles')) {
      let thresholds = [];
      if (legendColorScale.hasOwnProperty('thresholds')) { thresholds = legendColorScale.thresholds() }
      else { thresholds = legendColorScale.quantiles() }

      const barThresholds = [legendMinMax[0], ...thresholds, legendMinMax[1]];

      barAxis.tickValues(barThresholds);

      for (let i=0; i<barThresholds.length-1; i++) {
        let dataStart = barThresholds[i];
        let dataEnd = barThresholds[i+1];
        let pixelStart = barAxis.scale()(dataStart);
        let pixelEnd = barAxis.scale()(dataEnd);

        bar.append("rect")
          .attr("x", pixelStart)
          .attr("y", 0)
          .attr("width", pixelEnd - pixelStart )
          .attr("height", barHeight)
          .style("fill", legendColorScale( (dataStart + dataEnd) / 2.0 ) );
      }
    }

    else if (legendColorScale.hasOwnProperty('rangeRound')) {

      for (let i=0; i<legendBarWidth; i=i+stepSize) {

        let center = i+(stepSize/2);
        let dataCenter = barAxis.scale().invert( center );

        if ( dataCenter < legendMinMax[0] ) {
          bar.append("rect")
            .attr("x", i)
            .attr("y", 0)
            .attr("width", stepSize)
            .attr("height",barHeight)
            .style("fill", legendColorScale( legendMinMax[0] ) );
        }

        else if ( dataCenter < legendMinMax[1] ) {
          bar.append("rect")
              .attr("x", i)
              .attr("y", 0)
              .attr("width", stepSize)
              .attr("height",barHeight)
              .style("fill", legendColorScale( dataCenter ) );
        }

        else {
          bar.append("rect")
              .attr("x", i)
              .attr("y", 0)
              .attr("width", stepSize)
              .attr("height",barHeight)
              .style("fill", legendColorScale( legendMinMax[1] ) );
        }

      }
    }

    else {
      let nomVals = legendColorScale.domain().sort();


      let barScale = d3.scaleBand().domain(nomVals)
                                  .range([0,legendBarWidth])
                                  .padding(0.05);
      barAxis.scale(barScale);


      nomVals.forEach( d => {
        bar.append("rect")
          .attr("x", barScale(d) )
          .attr("y", 0)
          .attr("width", barScale.bandwidth() )
          .attr("height", barHeight)
          .style("fill", legendColorScale( d ) );
      });
    }

    legend.append("g")
          .attr("class", "legend axis")
          .attr("transform",`translate(${offsets.width},${offsets.top+barHeight+5})`)
          .call(barAxis);
    // credit: Prof.Rz
  }