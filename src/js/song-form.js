{
    let view = {
        el: '.page > main .song-info',
        template: `
            <form>
                <div class="row">
                    <label for="song-name">歌曲标题：</label>
                    <input id="song-name" name="name" type="text" value="__name__" required/>
                </div>
                <div class="row">
                    <label for="song-singer">歌&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;手：</label>
                    <input id="song-singer" name="singer" type="text" value="__singer__" required/>
                </div>
                <div class="row">
                    <label for="song-url">歌曲链接：</label>
                    <input id="song-url" name="url" type="text" value="__url__" required/>
                </div>
                <div class="row">
                    <input class="disabled" id="submit-button" name="submit-button" type="submit" />
                </div>
            </form>
        `,
        render(data = {}){
            let placeholder = ['name', 'singer', 'url', 'id'];
            let html = this.template;
            placeholder.map((string)=>{
                html = html.replace(`__${string}__`, data[string] || '')
            });
            $(this.el).html(html);
            return data;
        },
        focusBtn(){
            $(this.el).find('[name=submit-button]').removeClass('disabled');
        },
        disabledBtn(){
            $(this.el).find('[name=submit-button]').addClass('disabled');
        }
    };
    let model = {
        data:{
            name: '', singer:'', url:'', id: ''
        },
        update(data){
            var song = AV.Object.createWithoutData('Song', this.data.id);
            song.set('name', data.name);
            song.set('singer', data.singer);
            song.set('url', data.url);
            return song.save().then((response)=>{
                Object.assign(this.data, data);
                return response
            });
        },
        create(data){
            var Song = AV.Object.extend('Song');
            var song = new Song();
            song.set('name', data.name);
            song.set('singer', data.singer);
            song.set('url', data.url);
            return song.save().then((newSong) => {
                let {id, attributes} = newSong;
                Object.assign(this.data = {id, ...attributes });
            }, (errer) => {
                console.log(errer);
            })
        }

    };
    let controller = {
        init(view,model){
            this.view = view;
            this.model = model;
            this.view.render(this.model.data);
            this.bindevent();
            this.bindEventHub();
        },
        bindevent(){
            $(this.view.el).on('submit','form', (e) => {
                e.preventDefault();
                if(this.model.data.id){
                    this.update()
                }else{
                    this.create();
                }
                this.view.disabledBtn()
            });

            $(this.view.el).on('change','input', (e) => {
                let data = this.getData();

                if(this.model.data !== data){
                    this.view.focusBtn()
                }else{
                    this.view.disabledBtn()
                }
            })
        },
        create(){
            let data = this.getData();

            this.model.create(data).then(()=>{
                this.view.render({});
                let string = JSON.stringify(this.model.data);
                let object = JSON.parse(string);
                window.eventHub.emit('create', object);
                window.location.reload()
            });

            alert("提交成功")
        },
        update(){
            let data = this.getData();

            this.model.update(data).then(()=>{
                window.eventHub.emit('update', this.JSON.parse(JSON.stringify(this.model.data)));
            });

            alert("提交成功")
        },
        getData(){
            let needs = 'name singer url'.split(' ');
            let data = {};
            needs.map((string)=>{
                data[string] = $(this.view.el).find(`[name="${string}"]`).val();
            });
            return data
        },
        bindEventHub(){
            window.eventHub.on('renderForm', (data)=>{
                this.view.render(data);
                this.model.data = {
                    name: '', singer:'', url:'', id: ''
                };
                if(this.model.data !== data){
                    this.view.focusBtn()
                }else{
                    this.view.disabledBtn()
                }
            });
            window.eventHub.on('select', (data)=>{
                this.model.data = data;
                this.view.render(data);
            })
        }
    };
    controller.init(view,model);
}