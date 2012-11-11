var socket = io.connect('192.168.6.102:3000/echo');
var myIcon = [
				{ "icon": ":boss:", "src": "http://thiendung.info/blog/wp-content/plugins/smilies-themer/Julianus/boss.png" },
				{ "icon": ":beat:", "src": "http://thiendung.info/blog/wp-content/plugins/smilies-themer/Julianus/beat_shot.png" },
				{ "icon": ":smile:", "src": "http://thiendung.info/blog/wp-content/plugins/smilies-themer/Julianus/big_smile.png" },
				{ "icon": ":beauty:", "src": "http://vozforums.com/images/smilies/Off/beauty.gif" },
                { "icon": ":straing:", "src": "/pages/smiles13.png" },
                { "icon": ":heart:", "src": "/pages/smiles14.png" },
                { "icon": ":blacksmile:", "src": "/pages/smiles16.png" },
                { "icon": ":smoke:", "src": "pages/smile18.png" },
               { "icon": ":cungcung:", "src": "pages/smiles19.png" },
               { "icon": ":hot:", "src": "pages/smiles21.png" },
               { "icon": ":hoteye:", "src": "pages/smiles22.png" },
               { "icon": ":stupid:", "src": "pages/smiles25.png" },
               { "icon": ":cry:", "src": "pages/smiles27.png" },
];
socket.on('echo-echo', function (data) {
    var div = $('<div class="message" />')
      .append($('<div class="author" />').text(data.socketId));
    var token = data.message.split(" ");

    for (i = 0; i < token.length; i++) {
        for (j = 0 ; j < myIcon.length; j++) {
            if (myIcon[j].icon == token[i]) {
                div.append('<img src="' + myIcon[j].src + '"> ');
                break;
            }
        }
        if (j >= myIcon.length)
            div.append(' ' + token[i] + ' ');
    }
    $('#output').prepend(div);
});

(function ($) {
    $(document).ready(function () {
        var $message = $('#message');
        var $submit = $('#submit');

        $message.focus();

        $submit.click(function (e) {
            var message = $message.val();
            if (message) {
                socket.emit('echo-message', { message: message });
                $message.val('');
            }
            e.preventDefault();
        });
    });
})(jQuery);