all: fetch

fetch:
	test -e fixture.html || curl -L -o fixture.html "https://www.melonbooks.co.jp/circle/index.php?circle_id=3753"

refresh:
	rm fixture.html
	$(MAKE) fetch
