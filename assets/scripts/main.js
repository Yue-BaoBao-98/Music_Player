/*AIs:
1. Render all songs into playlist
2. Resize CD pic when scroll
4. progress bar: Play / Pause / Seek
5. Next / Previous
6. Random
7. Next / Repeat when enabled
8. Active song
9. Scroll to active song
10. Play clicked song
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const MUSIC_PLAYER_KEY = 'MUSIC_PLAYER';

const player = $('.player');

const current_song_name = $('header h2');
const current_song_artist = $('header h3');
const current_song_img = $('.cd-thumb');
const current_song_audio = $('#audio');

const cd = $('.cd');
const progress_bar = $('#progress_bar');
const progress = $('#progress');
const playlist = $('.playlist');

const play_btn = $('.btn_toggle_play');
const next_btn = $('.btn_next');
const prev_btn = $('.btn_prev');
const repeat_btn = $('.btn_repeat');
const random_btn = $('.btn_random');

const music_app = {
    config: JSON.parse(localStorage.getItem(MUSIC_PLAYER_KEY)) || {},
    set_config: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(MUSIC_PLAYER_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: 'Die With A Smile',
            artist: 'Lady Gaga, Bruno Mars',
            path: './assets/songs/Die With A Smile - Lady Gaga, Bruno Mars.mp3',
            image: './assets/img/Die With A Smile - Lady Gaga, Bruno Mars.jpeg',
        },
        {
            name: 'Listen Not',
            artist: 'Game Science',
            path: './assets/songs/Listen_Not-Black_Myth_Wukong_OST.mp3',
            image: './assets/img/Listen_Not.jpg',
        },
        {
            name: 'APT',
            artist: 'ROSE, Bruno Mars',
            path: './assets/songs/APT - ROSE, Bruno Mars.mp3',
            image: './assets/img/APT - ROSE, Bruno Mars.png',
        },
        {
            name: 'Celestial Symphony',
            artist: 'Game Science',
            path: './assets/songs/Celestial_Symphony-Black_Myth_Wukong_OST.mp3',
            image: './assets/img/Celestial_Symphony.jpg',
        },
        {
            name: 'Nhắm Mắt Thấy Mùa Hè',
            artist: 'Nguyên Hà',
            path: './assets/songs/Nhắm_Mắt_Thấy_Mùa_Hè-Nguyên_Hà-Nhắm_Mắt_Thấy_Mùa_Hè_OST.mp3',
            image: './assets/img/Nham_Mat_Thay_Mua_He.jpg',
        },
        {
            name: 'Tự Sự',
            artist: 'Orange',
            path: './assets/songs/Tự_Sự-Orange.mp3',
            image: './assets/img/Tu_Su.jpg',
        },
        {
            name: 'Angeleyes',
            artist: 'ABBA',
            path: './assets/songs/Angeleyes-ABBA.mp3',
            image: './assets/img/Angeleyes-ABBA.jpg',
        },
        {
            name: 'Chưa Được Yêu Như Thế',
            artist: 'Trang',
            path: './assets/songs/Chua_Duoc_Yeu_Nhu_The_Trang.mp3',
            image: './assets/img/Chua_Duoc_Yeu_Nhu_The_Trang.jpg',
        },
        {
            name: 'Espresso',
            artist: 'Sabrina Carpenter',
            path: './assets/songs/Espresso_Sabrina Carpenter.mp3',
            image: './assets/img/Espresso_Sabrina Carpenter.jpg',
        },
        {
            name: 'Fried Rice',
            artist: 'Lew Sid',
            path: './assets/songs/Fried Rice - Lew Sid.mp3',
            image: './assets/img/Fried Rice - Lew Sid.jpg',
        },
        {
            name: 'Leave Before You Love Me',
            artist: 'Marshmello, Jonas Brothers',
            path: './assets/songs/Leave_Before_You_Love_Me_Marshmello_Jonas_Brothers.mp3',
            image: './assets/img/Leave_Before_You_Love_Me_Marshmello_Jonas_Brothers.jpg',
        },
        {
            name: 'Please Please Please',
            artist: 'Sabrina Carpenter',
            path: './assets/songs/Please Please Please - Sabrina Carpenter.mp3',
            image: './assets/img/Please Please Please - Sabrina Carpenter.jpg',
        },
    ],
    current_song_index: 0,
    song_is_playing: false,

    song_is_random: false,
    shuffle_is_duplicate: false,
    shuffle_index: 0,
    shuffle_songs_list: new Array(6),

    song_is_repeat: false,

    //render: use to render the songs (name, singer, img path) into html
    render: function () {
        //htmls var for output into playlist section in html file
        const htmls = this.songs.map((song, index) => {
            return `
        <div class="song ${index === this.current_song_index ? 'active' : ''}" data-song_index="${index}">
          <div
            class="thumb"
            style="
              background-image: url('${song.image}');
            "
          ></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.artist}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
        `;
        });
        //render html code into html file
        playlist.innerHTML = htmls.join('');
    },

    //handle_events: use to listen and execute DOM events
    handle_events: function () {
        const _this = this;
        //take the initial width of the cd ele
        const cd_width = cd.offsetWidth;
        //print all locations when scroll in vertical
        // console.log(document.documentElement.scrollTop);

        //resize the CD picture base on the scroll action in the list
        document.onscroll = function () {
            // set a var for scroll list, value starts with the top of the list
            let scroll_val = window.scrollY || document.documentElement.scrollTop;
            let new_cd_width = cd_width - scroll_val;
            // console.log("cd width after scroll: ", new_cd_width);

            cd.style.transition = 'all 0.125s ease';
            cd.style.width = new_cd_width > 0 ? new_cd_width + 'px' : 0 + 'px';
            cd.style.opacity = new_cd_width / cd_width;
        };

        //handle rotation of cd img
        let cd_img_rotation = current_song_img.animate([{ transform: 'rotate(360deg)' }], {
            duration: 14000, //1 rotation in 6s
            iterations: Infinity, //rotate infinity
        });
        cd_img_rotation.pause();

        //handle play/pause btn: Logic web: Listen for song audio event not check by the var song_is_playing
        // play/pause song when clicked play/pause
        // also rotate the cd image when the song play/pause
        play_btn.onclick = function () {
            if (_this.song_is_playing == true) {
                current_song_audio.pause();
            } else {
                current_song_audio.play();
            }
        };

        // when song is playing => Listen audio event => Add classList + song_is_playing = true
        current_song_audio.onplay = function () {
            player.classList.add('playing');
            _this.song_is_playing = true;
            cd_img_rotation.play();
        };

        // when song is pause => Remove classList + song_is_playing = true
        current_song_audio.onpause = function () {
            player.classList.remove('playing');
            _this.song_is_playing = false;
            cd_img_rotation.pause();
        };

        // // 1st way to set progress bar by input tag
        // // progress bar change when song is playing
        // current_song_audio.ontimeupdate = function () {
        //   if (current_song_audio.duration) {
        //     //calculate the percentage progress of the song
        //     let progress_val = Math.floor(
        //       (current_song_audio.currentTime / current_song_audio.duration) * 100
        //     );
        //     //set value for the progress bar
        //     progress.value = progress_val;
        //   }
        // };

        // // seek song when change in progress bar
        // progress.oninput = function (e) {
        //   // print the % of progress bar then change or click on it
        //   // console.log(e.target.value);
        //   // get the current percentage of the progress bar when seek
        //   let seek_bar_progress = e.target.value;
        //   console.log(seek_bar_progress);
        //   if (current_song_audio.duration) {
        //     current_song_audio.currentTime =
        //       (seek_bar_progress * current_song_audio.duration) / 100;
        //   }
        // };

        // 2nd way to set progress song bar by div
        // progress bar change when song is playing
        current_song_audio.ontimeupdate = function () {
            if (current_song_audio.duration) {
                //calculate the percentage progress of the song
                let progress_song_val = (current_song_audio.currentTime / current_song_audio.duration) * 100;
                //set value for the progress bar
                progress.style.width = `${progress_song_val}%`;
            }
        };

        // seek song when change in progress bar
        progress_bar.onclick = function (e) {
            //get the length of of the progress bar
            let progress_bar_dimension = progress_bar.getBoundingClientRect();
            // console.log("Progress bar dimension: ", progress_bar_dimension);

            //calculate the current position of the mouse from the left of the bar
            let mouse_pos = e.clientX - progress_bar_dimension.left;
            // console.log("Mouse position ", mouse_pos);
            //Ensure it won't exceed the width
            let acc_mouse_pos = Math.max(0, Math.min(mouse_pos, progress_bar_dimension.width));
            // get the current percentage of the progress bar when seek
            let seek_bar_progress = Math.floor((acc_mouse_pos / progress_bar_dimension.width) * 100);
            // console.log(seek_bar_progress);
            if (current_song_audio.duration) {
                current_song_audio.currentTime = (seek_bar_progress * current_song_audio.duration) / 100;
            }
        };

        // handle next song btn
        next_btn.onclick = function () {
            if (_this.song_is_random) {
                if (0 <= _this.shuffle_index && _this.shuffle_index < 6) {
                    // console.log("shuffle index: ", _this.shuffle_index);
                    _this.random_song();
                    _this.shuffle_index++;
                } else {
                    _this.shuffle_index = 0;
                    _this.shuffle_songs_list = new Array(6);
                    _this.random_song();
                    _this.shuffle_index++;
                }
            } else {
                _this.next_song();
            }
            current_song_audio.play();
            // _this.render();
            _this.update_active_song();
            _this.scroll_to_active_song();
        };

        //auto play next song when the current one is done
        //if repeat song => play current song again
        current_song_audio.onended = function () {
            if (_this.song_is_repeat) {
                current_song_audio.play();
            } else {
                next_btn.click();
            }
        };

        // handle previous song btn
        prev_btn.onclick = function () {
            if (_this.song_is_random) {
                if (0 <= _this.shuffle_index && _this.shuffle_index < 6) {
                    // console.log("shuffle index: ", _this.shuffle_index);
                    _this.random_song();
                    _this.shuffle_index--;
                } else {
                    _this.shuffle_index = 5;
                    _this.shuffle_songs_list = new Array(6);
                    _this.random_song();
                    _this.shuffle_index--;
                }
            } else {
                _this.previous_song();
            }
            current_song_audio.play();
            // _this.render();
            _this.update_active_song();
            _this.scroll_to_active_song();
        };

        //handle random song btn
        random_btn.onclick = function (e) {
            _this.song_is_random = !_this.song_is_random;
            random_btn.classList.toggle('active', _this.song_is_random);
            _this.set_config('song_is_random', _this.song_is_random);
        };

        //handle repeat btn
        repeat_btn.onclick = function (e) {
            _this.song_is_repeat = !_this.song_is_repeat;
            repeat_btn.classList.toggle('active', _this.song_is_repeat);
            _this.set_config('song_is_repeat', _this.song_is_repeat);
        };

        //handle click song in playlist => play that song
        //listen to playlist element
        playlist.onclick = function (e) {
            const song_node = e.target.closest('.song:not(.active)');
            // console.log("Click ele: ", e.target);
            // console.log("Click ele: ", e.target.closest);

            //listen to the clicked song in playlist without active
            //and don't listen to option
            if (song_node || e.target.closest('.option')) {
                // console.log("Click ele: ", e.target);
                if (song_node) {
                    //1st way
                    // console.log(
                    //   "song node index: ",
                    //   song_node.getAttribute("data-song-index")
                    // );

                    //2nd way
                    // console.log("song node index: ", song_node.dataset.song_index);
                    _this.current_song_index = Number(song_node.dataset.song_index);
                    _this.load_current_song_info();
                    // _this.render();
                    _this.update_active_song();
                    current_song_audio.play();
                }
            }
        };
    },

    //1st way: get the current song directly
    // get_current_song: function () {
    //   return this.songs[this.current_song_index];
    // },

    //2nd way: get current song by getter
    //use define property to define a current_song key by getter
    define_properties: function () {
        Object.defineProperty(this, 'current_song', {
            get: function () {
                return this.songs[this.current_song_index];
            },
        });
    },

    load_current_song_info: function () {
        current_song_name.textContent = this.current_song.name;
        current_song_artist.textContent = this.current_song.artist;
        current_song_img.style.backgroundImage = `url('${this.current_song.image}')`;
        current_song_audio.src = this.current_song.path;

        // console.log(current_song_name, current_song_img, current_song_audio);
    },

    load_config: function () {
        this.song_is_repeat = this.config.song_is_repeat;
        this.song_is_random = this.config.song_is_random;
    },

    next_song: function () {
        this.current_song_index++;
        if (this.current_song_index >= this.songs.length) {
            this.current_song_index = 0;
        }

        this.load_current_song_info();
    },

    previous_song: function () {
        this.current_song_index--;
        if (this.current_song_index < 0) {
            this.current_song_index = this.songs.length - 1;
        }

        this.load_current_song_info();
    },

    random_song: function () {
        let new_index;
        let shuffle_value;

        // console.log("shuffle_songs_list begin: ", this.shuffle_songs_list);
        if (this.shuffle_songs_list.includes(undefined)) {
            for (var i = 0; i < this.shuffle_songs_list.length; i++) {
                do {
                    shuffle_value = Math.floor(Math.random() * this.songs.length);
                } while (shuffle_value === this.current_song_index);

                for (var j = 0; j < this.shuffle_songs_list.length; j++) {
                    if (this.shuffle_songs_list[j] == shuffle_value && i !== j) {
                        this.shuffle_is_duplicate = true;
                        break;
                    } else {
                        this.shuffle_is_duplicate = false;
                    }
                }
                if (false == this.shuffle_is_duplicate) {
                    this.shuffle_songs_list.splice(i, 1, shuffle_value);
                    // console.log("shuffle_songs_list after: ", this.shuffle_songs_list);
                } else {
                    i--;
                }
            }
            // console.log("shuffle_songs_list final: ", this.shuffle_songs_list);
        }
        new_index = this.shuffle_songs_list[this.shuffle_index];
        // console.log("new random index: ", new_index);
        this.current_song_index = new_index;
        this.load_current_song_info();
    },

    scroll_to_active_song: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest',
            });
        }, 250);
    },

    update_active_song: function () {
        // Delete active class in the current played song
        const current_song_active = $('.song.active');
        if (current_song_active) {
            current_song_active.classList.remove('active');
        }
        // Add active class into the new song
        const new_song_active = $$('.song')[this.current_song_index];
        if (new_song_active) {
            new_song_active.classList.add('active');
        }
    },

    start: function () {
        this.load_config();

        //1st way to get current song
        // console.log(this.get_current_song());

        //2nd way to get current song
        this.define_properties();
        // console.log(this.current_song);

        this.handle_events();

        this.load_current_song_info();

        this.render();

        random_btn.classList.toggle('active', this.song_is_random);
        repeat_btn.classList.toggle('active', this.song_is_repeat);
    },
};

music_app.start();
