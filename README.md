# Arkanoid game jQuery plugin 

Just a simple arkanoid style game (MIT License)

-- Instructions -- 

- Unpack  

- Include plugin's styles
<link rel="stylesheet" href="css/arkanoid.css" type="text/css">


- Include jQuery library
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.js"></script>


- Include jQuery-UI for draggable racket
<script type="text/javascript" src="js/jquery-ui.min.js"></script>


- Include the plugin js code
<script type="text/javascript" src="js/arkanoid.js"></script>


- Create an empty container like &#x3C;div id=&#x22;my_arkanoid&#x22;&#x3E;&#x3C;/div&#x3E;

- Make it a fully functional game
<script type="text/javascript">
	$(document).ready(function () {
		$('#my_arkanoid').arkanoid();
	});
</script>

- Game controls: 
Move racket by left/right cursor keys or by dragging the racket
Start/Pause the game with spacebar key

-Bonuses:
Longer racket by hitting the golden brick
Extra ball after 9999 points

- Fully commented code if you want to extend it

Play a demo here:
https://webpage.gr/arkanoid/

Code is fun!  
