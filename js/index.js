var fillDur = 1

var tl = new TimelineMax({ repeat: -1, repeatDelay: 5 });
tl.fromTo("#wheel", 2, { drawSVG: "50% 50%" }, { drawSVG: "0% 100%" })
    .fromTo("#cannon", 2, { stroke: "#FFF", drawSVG: "50% 50%" }, { drawSVG: "0% 100%" })

    .fromTo(["#template", ".blue"], 2, { drawSVG: "50% 50%" }, { drawSVG: "0% 100%" })
    .to("#plate1", fillDur, { fill: "#EC1C2E" }, "fill")
    .to("#plate2", fillDur, { fill: "#CE1141" }, "fill")
    .to("#template", fillDur, { fill: "#A39161", stroke: "#A39161" }, "fill")
    .to(".blue", fillDur, { fill: "#003876", stroke: "#003876" }, "fill")
    .to("#wheel", fillDur, { fill: "#A39161", stroke: "#FFFFFF" }, "fill")
    .to("#cannon", fillDur, { fill: "#A39161", stroke: "#FFFFFF", strokeWidth: "2" }, "fill")
    .to("#bg", fillDur, { fill: "#fff" }, "fill")
    .to("#cannon-fill", fillDur, { opacity: 1 }, "fill")
    .fromTo(".text", .75, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, transformOrigin: "50% 50%" }, "-=.25")



    ;



