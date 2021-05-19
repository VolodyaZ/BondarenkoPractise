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
	let likeImg = user && user.likedPosts.filter((a)=>a === post.id).length > 0 ? 
						"images/likeActive.png" : "images/likeInactive.png";
	let str = `<div class="postHead">
					<p class="postinfo">${post.author}</p>
					<p class="postinfo">${convertToShortDate(post.createdAt)}</p>
					<div>` + 
						((user != null && post.author === user.username) ? 
						`<img src="images/editPost.png" onclick="controller.onEdit(${post.id})" class="icon">
						<img src="images/deletePost.png" onclick="controller.onDelete(this)" class="icon">`
						: ``)
					+ `</div>
				</div>
				<div class="imagePart">
					<img src="${post.photoLink}" class="main">
					<div class="overlay"><img src="${likeImg}" class="icon" onclick="controller.onLike(this, ${post.id})"></div>
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

	getPost(id) {
		return this._posts.find((p)=>p.id === id);
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
			return tempPosts.sort((a, b) => b.createdAt - a.createdAt);
		}
		return Array.from(this._posts.sort((a, b) => b.createdAt - a.createdAt));
	}

	addPost(post) {
		if (Post.validatePost(post)) {
			this._posts.push(post);
			this.saveToStorage();
		}
	}

	editPost(id, fieldsToChange) {
		let post = this._posts.find((p) => p.id === id);
		let keys = Object.keys(post);
		keys.forEach( function(element, index) {
			if (fieldsToChange.hasOwnProperty(element)) {
				post[element] = fieldsToChange[element];
			}
		});
		this.saveToStorage();
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

	static validateUser(user) {
		return user.hasOwnProperty('email') &&
		user.hasOwnProperty('password') &&
		user.hasOwnProperty('username') &&
		user.hasOwnProperty('likedPosts');
	}

}

class UserCollection {
	constructor(users) {
		this._users = users;
	}

	getUsers() {
		return this._users;
	}

	addUser(user) {
		if (User.validateUser(user)) {
			this._users.push(user);
			this.saveToStorage();
		}
	}

	deleteUser(email) {
		for (let i = 0; i < this._users.length; ++i) {
			if (this._users[i].email === email) {
				let copy = Post.deepCopy(this._users[i]);
				this._users.splice(i, 1);
				this.saveToStorage();
				return copy;
			}
		}
	}

	addLikedPost(user, id) {
		let ind = this._users.findIndex((u)=>u.email === user.email);
		this._users[ind].likedPosts.push(id);
		this.saveToStorage();
	}

	removeLikedPost(user, id) {
		let ind = this._users.findIndex((u)=>u.email === user.email);
		this._users[ind].likedPosts = this._users[ind].likedPosts.filter((i)=> i != id);
		this.saveToStorage();
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
		if (activeUser != null) {
			logged.style.display = 'block';
			notLogged.style.display = 'none';
			let username = document.getElementById('username');
			username.innerHTML = activeUser.username;
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

	onEdit(postId) {
		saveEditPostToStorage(this._postCollection.getPost(postId));
		window.location.href = "editPost.html";
	}

	onEditPageLoaded() {
		let title = document.getElementById("title");
		let post = restoreEditPostFromStorage();
		if (post != null) {
			let form = document.forms.editForm;
			form.name.value = post.name;
			form.description.value = post.description;
			form.hashtags.value = post.tags.reduce((s1, s2)=>s1 + " #" + s2);
			//form.image = post.photoLink;

			title.innerHTML = "Edit post";
		} else {
			title.innerHTML = "Create post";
		}
	}

	onSave() {
		let form = document.forms.editForm;
		let file = form.image.files[0];
		let reader = new FileReader();
		let imgSrc;
		let controller = this;
		reader.onloadend = function () {
			imgSrc = reader.result;
			
			//id is not accurate, needs to be done
			let str = form.hashtags.value;
			let tags = str.replaceAll('#', '').split(' ');
			let storedPost = restoreEditPostFromStorage();
			if (storedPost != null) {
				let post = new Post(storedPost.id, form.name.value , form.description.value, new Date(), storedPost.author, imgSrc, tags);
				controller._postCollection.editPost(storedPost.id, post);
			} else {
				let id = localStorage.getItem("freeId");
				if (!id) {
					localStorage.setItem("freeId", 100);
					id = 100;
				}
				id = parseInt(localStorage.getItem("freeId"), 10);
				let post = new Post(id, form.name.value , form.description.value, new Date(), user.username, imgSrc, tags);
				controller._postCollection.addPost(post);
				localStorage.setItem("freeId", ++id);
			}

			window.location.href = "feed.html";			
		}

		if (file) {
			reader.readAsDataURL(file);
		}

		return false;
	}

	onLogin() {
		let form = document.forms.loginForm;
		let email = form.email.value;
		let password = form.pswrd.value;
		let users = this._userCollection.getUsers().filter((a) => a.email === email);
		if (users.length) {
			if (users[0].password === password) {
				//user.authorise(users[0].username, users[0].likedPosts);
				user = users[0];
				saveActiveUserToStorage(user);
				window.location.href = "feed.html";
			}
		}
		alert('wrong email or password');
	}

	onLogout() {
		user = null;
		saveActiveUserToStorage(user);
		document.location.reload();
	}

	onRegister() {
		let form = document.forms.signUpForm;
		let existingUsers = this._userCollection.getUsers().filter((a) => a.email === form.email.value);
		if (!existingUsers.length && form.pswrd.value === form.pswrdConfirm.value) {
			let user = new User(form.email.value, form.pswrd.value, form.uname.value);
			this._userCollection.addUser(user);
			saveActiveUserToStorage(user);
			
			window.location.href = "titleScreen.html";
		}

		alert('user with this email is already existing or pasword and confirm password fields are different');
	}

	checkUser() {
		this._view.showAuthorised(user);
	}

	onLike(img, id) {
		if (user != null) {
			if (img.src) {
				if (img.src.includes("images/likeInactive.png")) {
					img.src = "images/likeActive.png";
					
					user.likedPosts.push(id);
					userCollection.addLikedPost(user, id);
				} else {
					img.src = "images/likeInactive.png";
					
					user.likedPosts = user.likedPosts.filter((i)=>i != id);
					userCollection.removeLikedPost(user, id);
				}
				saveActiveUserToStorage(user);
			}
		}
	}
}

function restoreActiveUserFromStorage() {
	if (!window.localStorage.getItem('activeUser')) {
		return null;
	}
	return JSON.parse(window.localStorage.getItem('activeUser'));
}

function saveActiveUserToStorage(activeUser) {
	window.localStorage.setItem('activeUser', JSON.stringify(activeUser));
}

function saveEditPostToStorage(post) {
	window.localStorage.setItem("editPost", JSON.stringify(post));
}

function restoreEditPostFromStorage() {
	return JSON.parse(window.localStorage.getItem("editPost"));
}

////////////////////////////////////////////////////////////////////

let postCollection = new PostCollection;
postCollection.restoreFromStorage();
let userCollection = new UserCollection;
userCollection.restoreFromStorage()
let view = new PostCollectionView();
let controller = new PostCollectionController(postCollection, view, userCollection);
let user = restoreActiveUserFromStorage();

window.onloadstart = postCollection.restoreFromStorage();