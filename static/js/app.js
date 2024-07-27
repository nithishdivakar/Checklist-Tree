Vue.component('item-editor', {
    props: ['ele'],
    methods : {
        u() {
            console.log("item-editor.u", this.ele.id);
            this.$emit('update', this.ele.id);
            this.ele.state='';
        },
        toggle() {
            this.ele.state='';
        }
    },
    template: `
        <div class="itm">
            <div class="itm-chk">
                <i v-if="ele.id != 0" class="chk-icon bi bi-plus-square-dotted" @click="toggle"></i>
            </div>
            <div class="itm-txt">
                <textarea v-model="ele.text" class="editor_area"></textarea>
                <br>
                <a href="#" @click.prevent="u" class="a-button">save</a>
                <br>
            </div>
        </div>
    `
});

Vue.component('item-container', {
    props: ['ele', 'children'],
    methods : {
        u() {
            console.log("item-container.u", this.ele.id);
            this.$emit('update', this.ele.id);
        },
        r(){
            console.log("item-container.r", this.ele.id);
            this.$emit('add', this.ele.id);
        },
        d(){
            console.log("item-container.d", this.ele.id);
            this.ele.archived = true;
            this.$emit('delete', this.ele.id);
            this.$forceUpdate();
        },
        s(state) {
            this.ele.state=state;
        },
        has_children(){
            return !(!this.children || !this.children.length)
        },
        toggleChecked() {
            this.ele.checked = !this.ele.checked;
            this.u();
        },
        markdownToHtml(description) {
          return marked.parse(description);
        }
    },
    template: `
        <div class="itm">
            <div class="itm-chk">
                <i v-if="ele.id != 0" class="bi chk-icon" :class="{'bi-check-square-fill': ele.checked, 'bi-square': !ele.checked}" @click="toggleChecked"></i>
            </div>
            <div class="itm-txt" v-html="markdownToHtml(ele.text)"></div>
            <div class="itm-act">
                <div class="subline">
                [
                    <a href="#" v-if="!has_children()" @click.prevent="r">reply</a>
                    <span v-if="ele.id!=0">
                        <span v-if="!has_children()">|</span>
                        <a href="#" @click.prevent="d">archive</a>
                        <span>|</span>
                        <a href="#" @click.prevent="s('edit')">edit</a>
                    </span>
                ]
                </div>
            </div>
        </div>
    `
});



Vue.component('itm', {
    props: ['ele', 'elements'],
    computed: {
        children() {
            return this.elements.filter(t => t.parent_id === this.ele.id && t.archived === false);
        }
    },
    methods: {
        u(id){
            console.log("itm.u", id);
            this.$emit('update', id);
        },
        r(id){
            console.log("itm.r", id);
            const new_child = {
                id: Math.floor(Date.now() / 1000),
                text: "",
                checked: false,
                parent_id: id,
                state: "edit",
                archived: false
            }
            this.elements.push(new_child);
        },
        d(id){
            console.log("itm.d", id);
            this.$emit('update', id);
        },
        s(state) {this.ele.state=state;},
        drawAdd(){
            if (!this.children || !this.children.length){
                // no children
                return false;
            }
            if (this.children.some(child => child.state === 'edit')) {
                // one of the children is being edited
                return false;
            }
            return true;
        }
    },
    template: `
        <li v-if="!ele.archived" v-bind:class="'ele_li ' + ele.state">
            <item-container v-if="ele.state === '' || ele.state === 'reply' " :key="ele.id" :ele="ele" :children="children" @update="u"  @add="r" @delete="d"></item-container>
            <item-editor v-if="ele.state === 'edit'" :key="ele.id" :ele="ele" @update="u"> </item-editor>
            <ul>
                <li v-if="ele.state === 'reply'">
                    <item-editor :key="ele.id" :ele="ele" @update="u"> </item-editor>
                    is this needed?
                </li>
                <itm v-for="child in children" :key="child.id" :ele="child" :elements="elements" @update="u"></itm>
                <li class="ele_li" v-if="drawAdd()">
                    <div class="itm">
                        <div class="itm-chk">
                            <i class="chk-icon bi bi-plus-square-dotted" @click.prevent="r(ele.id)" style="cursor: pointer;"></i>
                        </div>
                        <div class="itm-txt">
                        </div>
                    </div>
                </li>
            </ul>
        </li>
    `
});

new Vue({
    el: '#app',
    data: {
        itms: [],
        status_message: ''
    },
    mounted() {
        this.getItms();
    },
    computed: {
        topLevelItms() {
            return this.itms.filter(itm => itm.parent_id === -1);
        },
        headingContent() {
            if ( this.status_message == ''){
                return this.itms.filter(itm => !itm.checked).length +"/" + this.itms.length;
            }  else {
                return this.status_message;
            }
        }
    },
    methods: {
        getItms() {
            axios.get('/api/itms')
                .then(response => {
                    this.itms = response.data.map(itm => {
                        itm.state = '';
                        return itm;
                    });
                });
        },
        u(id){
            console.log("app.u",id);
            const ele = this.itms.filter(itm => itm.id === id)[0];
            axios.put(`/api/itms/${ele.id}`, ele)
                .then(response => {
                    console.log(response.data);

                    this.status_message = "Updated";
                    setTimeout(() => {
                        this.status_message = "";
                    }, 2000);

                });
        }
    }
});
