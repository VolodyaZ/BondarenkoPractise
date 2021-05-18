class Post  {
	constructor(id, name, description, createdAt, author, photoLink, tags) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.createdAt = createdAt;
		this.author = author;
		this.photoLink = photoLink;
		this.tags = tags;
	}

	static deepCopy(src) {
		return new Post(
			src.id, 
			src.name,
			src.description,
			src.createdAt,
			src.author,
			src.photoLink,
			src.tags
		);
	}

	static validatePost(post) {
		return post.hasOwnProperty('id') &&
		post.hasOwnProperty('name') &&
		post.hasOwnProperty('description') &&
		post.hasOwnProperty('createdAt') &&
		post.hasOwnProperty('author') &&
		post.hasOwnProperty('photoLink') &&
		post.hasOwnProperty('tags');
	}
}

function postToHTML(post) {
	let tagsStr = '';
	post.tags.forEach( function(element, index) {
		tagsStr += "#" + element + " ";
	});
	let str = `<div class="postHead">
					<p class="postinfo">${post.author}</p>
					<p class="postinfo">${convertToShortDate(post.createdAt)}</p>
					<div>` + 
						((user._authorized && post.author === user._name) ? 
						`<img src="images/editPost.png" onclick="controller.onEdit(this)" class="icon">
						<img src="images/deletePost.png" onclick="controller.onDelete(this)" class="icon">`
						: ``)
					+ `</div>
				</div>
				<div class="imagePart">
					<img src="${post.photoLink}" class="main">
					<div class="overlay"><img src="images/likeInactive.png" class="icon" onclick="controller.onLike(this, ${post.id})"></div>
				</div>
				<div class="postTitle">
					<h1 class="magName">${post.name}</h1>
					<div class="priceBox">$400</div>
				</div>
				<div class="stripe"></div>
				<div class="postBody">
					<p class="postDescr">${post.description}</p>
					<p class="tags">${tagsStr}</p>
				</div>
				<img src="images/upload.png" class="uploadImg">`;
	return str;
}

function convertToShortDate(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	return (day < 10 ? '0' + day : day) + "." + 
			(month < 10 ? '0' + month : month) + "." +
			date.getFullYear();
}

function onChecked(checkbox, objToActivateId) {
	let objToActivate = document.getElementById(objToActivateId);
	objToActivate.disabled = !checkbox.checked;
	if (objToActivate.disabled) {
		objToActivate.value = "";
	}
}

class PostCollection {
	constructor(postsArr) {
		this._posts = postsArr;
	}

	getPosts(filterConfigs = null) {
		if (filterConfigs) {
			let tempPosts = Array.from(this._posts);
			filterConfigs.forEach( function(element, index) {
				let key = Object.keys(element);
				if (key == "tags") {
					tempPosts = tempPosts.filter((a) => {
						for (let i = 0; i < element.tags.length; ++i) {
							for (let j = 0; j < a.tags.length; ++j) {
								if (element.tags[i] === a.tags[j]) {
									return true;
								}
							}
						}
						return false;
					});
				} else {
					tempPosts = tempPosts.filter((a) => !(a[key] < element[key]) && !(a[key] > element[key]));
				}
			});
			return tempPosts.sort((a, b) => a.createdAt - b.createdAt);
		}
		return Array.from(this._posts.sort((a, b) => a.createdAt - b.createdAt));
	}

	addPost(post) {
		if (Post.validatePost(post)) {
			this._posts.push(post);
			this.saveToStorage();
		}
	}

	editPost(id, fieldsToChange) {
		let post = _posts.find((p) => p.id === id);
		let keys = post.keys(post);
		keys.forEach( function(element, index) {
			if (fieldsToChange.hasOwnProperty(element)) {
				post[element] = fieldsToChange[element];
			}
		});

	}

	deletePost(id) {
		for (let i = 0; i < this._posts.length; ++i) {
			if (this._posts[i].id === id) {
				let copy = Post.deepCopy(this._posts[i]);
				this._posts.splice(i, 1);
				this.saveToStorage();
				return copy;
			}
		}
	}

	//local storage
	restoreFromStorage() {
		if (!window.localStorage.getItem('posts')) {
			populateStorage();
		}

		let posts = JSON.parse(window.localStorage.getItem('posts'));
		posts.forEach( function(post, i) {
			post.createdAt = new Date(post.createdAt);
		});
		this._posts = posts;
	}

	saveToStorage() {
		window.localStorage.setItem('posts', JSON.stringify(this._posts));
	}

	populateStorage() {
		let posts = [
			new Post(1, "mag", 'descr', new Date('2020-03-17'), '1', 'images/time.png', ['news', 'pop']),
			new Post(2, "mag", 'descr', new Date('2020-03-17'), '1', 'images/time.png', ['news', 'pop']),
			new Post(3, "mag", 'descr', new Date('2020-03-17'), '1', 'images/natgeo.png', ['science', 'nature']),
			new Post(4, "mag", 'descr', new Date('2020-03-17'), '4', 'images/time.png', ['news', 'pop']),
			new Post(5, "mag", 'descr', new Date('2020-03-12'), '5', 'images/natgeo.png', ['science', 'nature']),
			new Post(6, "mag", 'descr', new Date('2020-03-19'), '6', 'images/natgeo.png', ['science', 'nature']),
			new Post(7, "mag", 'descr', new Date('2020-03-17'), '7', 'images/time.png', ['news', 'pop']),
		];
		window.localStorage.setItem('posts', JSON.stringify(posts));
	}
}

class User {
	constructor(email, password, username) {
		this.email = email;
		this.password = password;
		this.username = username;
		this.likedPosts = [];
	}
}

class UserCollection {
	constructor(users) {
		this._users = users;
	}

	getUsers() {
		return this._users;
	}

	//local storage
	restoreFromStorage() {
		if (!window.localStorage.getItem('users')) {
			this.populateStorage();
		}

		this._users = JSON.parse(window.localStorage.getItem('users'));
	}

	saveToStorage() {
		window.localStorage.setItem('users', JSON.stringify(this._users));
	}

	populateStorage() {
		let users = [
			new User("mail1", "pass", "pizzalover"),
			new User("mail2", "pass2", "pizzalover2"),
			new User("mail3", "pass3", "pizzalover3"),
		];
		window.localStorage.setItem('users', JSON.stringify(users));
	}
}

class PostCollectionView {
	appendPosts(posts, disableLoadBtn = false) {
		let feed = document.getElementById("feed");
		for (let i = 0; i < posts.length; ++i) {
			let tmp = postToHTML(posts[i]);
			let el = document.createElement('div');
			el.className = "post";
			el.setAttribute('data-id', posts[i].id);
			el.innerHTML = tmp;
			feed.appendChild(el);
		}
		let btn = document.getElementById('loadbtn');
		btn.disabled = disableLoadBtn;
	}

	clearFeed() {
		let feed = document.getElementById("feed");
		feed.innerHTML = "";
	}

	showPosts(posts, disableLoadBtn = false) {
		let feed = document.getElementById("feed");
		feed.innerHTML = "";
		appendPosts(posts, disableLoadBtn);
	}

	showAuthorised(activeUser) {
		let logged = document.getElementById('logged');
		let notLogged = document.getElementById('notLogged');
		if (activeUser._authorized) {
			logged.style.display = 'block';
			notLogged.style.display = 'none';
			let username = document.getElementById('username');
			username.innerHTML = activeUser._name;
		} else {
			logged.style.display = 'none';
			notLogged.style.display = 'block';
		}
	}
}

class PostCollectionController {
	constructor(postCollection, view, userCollection) {
		this._postCollection = postCollection;
		this._view = view;
		this._userCollection = userCollection;

		this._filteredPosts = postCollection.getPosts();
		this._lastLoadedPost = -1;
	}

	loadPosts(amount) {
		let toLoad = this._filteredPosts.slice(this._lastLoadedPost + 1, this._lastLoadedPost + 1 + amount);
		this._lastLoadedPost += toLoad.length;
		this._view.appendPosts(toLoad, this._filteredPosts.length - 1 <= this._lastLoadedPost);
	}

	reloadPosts(amount) {
		this._lastLoadedPost = -1;
		this._view.clearFeed();
		this.loadPosts(amount);
	}

	onSearchBtnClick() {
		let filterConfigs = [];
		let authorCheckbox = document.getElementById('checkbox_author');
		if (authorCheckbox.checked) {
			let authorName = document.getElementById('search_author');
			filterConfigs.push({author: authorName.value});
		}

		let dateCheckbox = document.getElementById('checkbox_date');
		if (dateCheckbox.checked) {
			let date = document.getElementById('search_date');
			filterConfigs.push({createdAt: new Date(date.value)});
		}

		let tagsCheckbox = document.getElementById('checkbox_tags');
		if (tagsCheckbox.checked) {
			let tags = document.getElementById('search_hashtags').value;
			tags = tags.replaceAll('#', '');
			tags = tags.split(' ');
			filterConfigs.push({tags: tags});
		}

		this._filteredPosts = this._postCollection.getPosts(filterConfigs);
		if (this._filteredPosts.length == 0) {
			alert("no posts found");
		} else {
			this._lastLoadedPost = -1;
			this.reloadPosts(10);
		}
	}

	onDelete(deleteBtn) {
		let postNode = deleteBtn.parentNode.parentNode.parentNode;
		let id = parseInt(postNode.getAttribute("data-id"), 10);
		let deletedPost = this._postCollection.deletePost(id);
		let ind = this._filteredPosts.indexOf(this._filteredPosts.find((a) => a.id == deletedPost.id));
		this._filteredPosts.splice(ind, 1);
		this.reloadPosts(this._lastLoadedPost);
	}

	onSave() {
		let form = document.forms.editForm;
		//id is not accurate, needs to be done
		let str = form.hashtags.value;
		let tags = str.replaceAll('#', '').split(' ');
		let post = new Post(9, form.name.value , form.description.value, new Date(), user._name, form.image, tags);
		this._postCollection.addPost(post);
		window.location.href = "feed.html";
		return false;
	}

	onLogin() {
		let form = document.forms.loginForm;
		let email = form.email.value;
		let password = form.pswrd.value;
		let users = this._userCollection.getUsers().filter((a) => a.email === email);
		if (users.length) {
			if (users[0].password === password) {
				user.authorise(users[0].username, users[0].likedPosts);
				window.location.href = "feed.html";
			}
		}
		alert('wrong email or password');
	}

	onLogout() {
		user.logout();
		this.checkUser();
	}

	checkUser() {
		this._view.showAuthorised(user);
	}

	onLike(img, id) {
		if (img.src) {
			img.src = "images/likeActive.png";
			//add id to user liked arr
		}
	}
}

class ActiveUser {
	constructor(name, authorized) {
		this._name = name;
		this._authorized = authorized;
		this._likedPosts = [];
	}

	authorise(name, likedPosts) {
		if (!this._authorized) {
			this._name = name;
			this._likedPosts = likedPosts;
			this._authorized = true;
			this.saveToStorage();
		}
	}

	logout() {
		this._authorized = false;
		this.saveToStorage();
	}

	restoreFromStorage() {
		if (!window.localStorage.getItem('activeUser')) {
			this.populateStorage();
		}
		let user = JSON.parse(window.localStorage.getItem('activeUser'));
		this._name = user._name;
		this._authorized = user._authorized;
		this._likedPosts = user._likedPosts;
	}

	saveToStorage() {
		window.localStorage.setItem('activeUser', JSON.stringify(new ActiveUser(this._name, this._authorized)));
	}

	populateStorage() {
		let user = new ActiveUser("", false);
		window.localStorage.setItem('activeUser', JSON.stringify(user));
	}
}
////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////

let postCollection = new PostCollection;
postCollection.restoreFromStorage();
let userCollection = new UserCollection;
userCollection.restoreFromStorage()
let view = new PostCollectionView();
let controller = new PostCollectionController(postCollection, view, userCollection);
let user = new ActiveUser("", false);

window.onloadstart = postCollection.restoreFromStorage();
window.onloadstart = user.restoreFromStorage();