var typograph = require('../typograph');

var params = {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed semper dui non justo bibendum vel tincidunt arcu tristique. Sed luctus luctus elit ut facilisis. Donec cursus magna a libero interdum ac luctus lacus auctor. Fusce sit amet lorem urna, ut molestie sem. Nunc imperdiet pretium sagittis. Mauris aliquam, nibh ac accumsan molestie, metus diam facilisis lectus, non mollis metus dolor nec urna. Aliquam accumsan tincidunt libero, et blandit diam dictum et. Donec lorem est, vulputate at blandit sit amet, sodales in orci. Donec quis nunc nulla. Nam sollicitudin viverra eleifend. Nulla facilisi. Pellentesque a arcu in tellus imperdiet euismod. Fusce convallis ullamcorper consequat."
}

typograph.start(params, function(err, data){
    if(err == null){
        console.log(data);
    } else {
        console.log(err);
    }
});