const switcher = document.querySelector('#cbx'),
      more = document.querySelector('.more'),
      modal = document.querySelector('.modal'),
      videosWrapper = document.querySelector('.videos__wrapper'),
      formSearch = document.querySelector('.search'),
      searchInput = document.querySelector('.search > input'),
      videos = document.querySelectorAll('.videos__item');
      
let player;

///////////////  SLIDE TOGGLE  ///////////////

function bindSlideToggle(trigger, boxBody, content, openClass) {
    let button = {
        'element': document.querySelector(trigger),
        'active': false
    }
    const box = document.querySelector(boxBody),
          boxContent = document.querySelector(content);

    button.element.addEventListener('click', () => {
        if (button.active === false){
            button.active = true;
            box.style.height = boxContent.clientHeight + 'px';
            box.classList.add(openClass);

        } else {
            button.active = false;
            box.style.height = 0 + 'px';
            box.classList.remove(openClass);
        }
    });
}

bindSlideToggle('.hamburger', '[data-slide="nav"]', '.header__menu', 'slide-active');

///////////////  NIGHT SWITCH MODE  ///////////////

let night = false;

function switсhMode () {
    
    if(night === false) {

        night = true;

        document.body.classList.add('night');

        document.querySelectorAll('.hamburger > line').forEach(i => {
            i.style.stroke = '#fff';
        });

        document.querySelectorAll('.videos__item-descr').forEach(i => {
            i.style.color = '#fff';
        });

        document.querySelectorAll('.videos__item-views').forEach(i => {
            i.style.color = '#fff';
        });
        
        document.querySelector('.header__item-descr').style.color = '#fff';

        document.querySelector('.logo > img').src = 'logo/youtube_night.svg';

    } else {
        night = false;

        document.body.classList.remove('night');

        document.querySelectorAll('.hamburger > line').forEach(i => {
            i.style.stroke = '#000';
        });

        document.querySelectorAll('.videos__item-descr').forEach(i => {
            i.style.color = '#000';
        });

        document.querySelectorAll('.videos__item-views').forEach(i => {
            i.style.color = '#000';
        });

        document.querySelector('.header__item-descr').style.color = '#fff';
        document.querySelector('.logo > img').src = 'logo/youtube.svg';
    }
}

switcher.addEventListener('change', () => {
    switсhMode();
});

////////////////////////////////////////////////////////////

///////////////  LOAD SEARCH VIDEO  ///////////////

function search(target ) {
    gapi.client.init({
        'apiKey': 'AIzaSyDQXhE3GvDXew51d_xCh79sa_ifGb9vGIw',
        'discoveryDocs': ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"]
    }).then(function(){
        return gapi.client.youtube.search.list({
            "part": "snippet",
            "maxResults": '18',
            "q": `${target}`,
            "type":''
        });
    }).then(function(response){
        console.log(response.result);
        videosWrapper.innerHTML = '';
        response.result.items.forEach(i => {
            let card = document.createElement('a');
            card.classList.add('videos__item', 'videos__item-active');
            card.setAttribute('data-url', i.id.videoId);

            card.innerHTML = `
                <img src="${i.snippet.thumbnails.high.url}" alt="thumb">
                <div class="videos__item-descr">
                    ${i.snippet.title}                  
                </div>
                <div class="videos__item-views">
                    20.23423
                </div>
            `;
            
            videosWrapper.appendChild(card);

            setTimeout(() => {
                card.classList.remove('videos__item-active');
            },10 ); // animate delay

            if (night === true) {
                card.querySelector('.videos__item-descr').style.color = '#fff';
                card.querySelector('.videos__item-views').style.color = '#fff';
            }
        });
        sliceTitle('.videos__item-descr', 100);
        bindModal(document.querySelectorAll('.videos__item'));
    });
}

formSearch.addEventListener('submit', (e) => {
    e.preventDefault();
    
    more.remove();
    gapi.load('client', () => {search(searchInput.value)});
    // searchInput.value = '';
});

////////////////////////////////////////////////////////////

///////////////  LOAD VIDEO  ///////////////

function start() {
    gapi.client.init({
        'apiKey': 'AIzaSyDQXhE3GvDXew51d_xCh79sa_ifGb9vGIw',
        'discoveryDocs': ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"]
    }).then(function(){
        return gapi.client.youtube.playlistItems.list({
            "part": "snippet,contentDetails",
            "maxResults": '6',
            "playlistId": "PL3LQJkGQtzc4gsrFkm4MjWhTXhopsMgpv"
        })
    }).then(function(response) {
        console.log(response.result)

        response.result.items.forEach(i => {
            let card = document.createElement('a');

            card.classList.add('videos__item', 'videos__item-active');
            card.setAttribute('data-url', i.contentDetails.videoId);
            card.innerHTML = `
                <img src="${i.snippet.thumbnails.high.url}" alt="thumb">
                <div class="videos__item-descr">
                    ${i.snippet.title}                  
                </div>
                <div class="videos__item-views">
                    20.23423
                </div>
            `;
            
            videosWrapper.appendChild(card);
            setTimeout(() => {
                card.classList.remove('videos__item-active');
            },10 + i * 200); // animate delay

            if (night === true) {
                card.querySelector('.videos__item-descr').style.color = '#fff';
                card.querySelector('.videos__item-views').style.color = '#fff';
            }
        });
        sliceTitle('.videos__item-descr', 100);
        bindModal(document.querySelectorAll('.videos__item'));

        
    }).catch( e => {
        console.log(e);
    });
}

more.addEventListener('click',() => {
    more.remove();
    gapi.load('client',start);
});

////////////////////////////////////////////////////////////

///////////////  SLICE TEXT  ///////////////

function sliceTitle (selector, count) {
    document.querySelectorAll(selector).forEach(item => {
        item.textContent.trim();
        if (item.textContent.length < count) {
            return;
        } else {
            const str = item.textContent.slice(0, count + 1)+ '...';
            item.textContent = str;
        }
    });
}

////////////////////////////////////////////////////////////

///////////////  MODAL  ///////////////

function openModal (){
    modal.style.display = 'block';
}
function closeModal (){
    modal.style.display = 'none';
    player.stopVideo();
}

function bindModal(cards) {
    cards.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const id = item.getAttribute('data-url');
            loadVideo(id);
            openModal();
        });
    });
}

modal.addEventListener('click', (e) => {
    if (!e.target.classList.contains('modal__body')) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.keyCode === 27) {
        closeModal();
    }
});

////////////////////////////////////////////////////////////

function createVideo () {
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    setTimeout(() => {
        player = new YT.Player('frame', {
            height: '100%',
            width: '100%',
            videoId: 'M7lc1UVf-VE'
        });
    }, 1000);
}

createVideo();

function loadVideo (id) {
    player.loadVideoById ({'videoId': `${id}`});
}

// AIzaSyDQXhE3GvDXew51d_xCh79sa_ifGb9vGIw