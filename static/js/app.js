Vue.component('item-editor', {
    props: ['ele'],
    methods : {
        u() {
            console.log("item-editor.u",this.ele.id);
            this.$emit('update', this.ele.id);
            this.ele.state='';
        }
    },
    template: `
        <div>
            <textarea v-model="ele.text" style="width:100%"></textarea>
            <a href="#" @click.prevent="u">save</a>
        </div>
    `
});

Vue.component('item-container', {
    props: ['ele'],
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
            this.$emit('delete', this.ele.id);
        },
        s(state) {
            this.ele.state=state;
        }
    },
    template: `
        <div>
            <input v-if="ele.id!=0" class="ele_checkbox" type="checkbox" v-model="ele.checked" @change="u"> {{ ele.text }}
            <span class="operations">
                [<a href="#" @click.prevent="r">+</a><span v-if="ele.id!=0">|</span><a v-if="ele.id!=0" href="#" @click.prevent="d">-</a><span v-if="ele.id!=0">|</span><a v-if="ele.id!=0" href="#" @click.prevent="s('edit')">x</a>]
            </span>
        </div>
    `
});



Vue.component('todo-item', {
    props: ['ele', 'elements'],
    computed: {
        children() {
            return this.elements.filter(t => t.parent_id === this.ele.id);
        }
    },
    methods: {
        u(id){
            console.log("todo-item.u",id);
            this.$emit('update', id);
        },
        r(id){
            console.log("todo-item.r",id);
            const new_child = {
                id: Math.floor(Date.now() / 1000),
                text: '',
                checked: false,
                parent_id: id,
                state: 'edit'
            }
            this.elements.push(new_child);
        },
        d(id){
            console.log("todo-item.d",id);
            //TODO
        },
        addChild(){
            const newItem = {
                content: this.ele.state_content,
                checked: false,
                p_id: this.ele.id,
                state: "",
                state_content:""
            };
            this.$emit('add', newItem);
        }
    },
    template: `
        <li class="ele_li">
            <item-container v-if="ele.state === '' || ele.state === 'reply' " :key="ele.id" :ele="ele" @update="u"  @add="r" @delete="d"></item-container>
            <item-editor v-if="ele.state === 'edit'" :key="ele.id" :ele="ele" @update="u"> </item-editor>

            <ul>            
                <li v-if="ele.state === 'reply'"> 
                    <item-editor :key="ele.id" :ele="ele" @update="u"> </item-editor>
                </li>
                <todo-item v-for="child in children" :key="child.id" :ele="child" :elements="elements" @update="u"></todo-item>
            </ul>
        </li>
    `
});

new Vue({
    el: '#app',
    data: {
        todos: [],
        newTodoText: ''
    },
    mounted() {
        this.getTodos();
    },
    computed: {
        topLevelTodos() {
            return this.todos.filter(todo => todo.parent_id === -1);
        }
    },
    methods: {
        getTodos() {
            axios.get('/api/todos')
                .then(response => {
                    this.todos = response.data.map(todo => {
                        todo.state = '';
                        todo.state_content = '';
                        return todo;
                    });
                });
        },
        c(todo){
            axios.post('/api/todos', todo)
                .then(response => {
                    this.todos.push(response.data);
                    this.newTodoText = '';
                });
        },
        u(id){
            console.log("app.u",id);
            const ele = this.todos.filter(todo => todo.id === id)[0];
            axios.put(`/api/todos/${ele.id}`, ele)
                .then(response => {
                    console.log(response.data);
                });
        }
    }
});
