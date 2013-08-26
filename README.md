findR.js
========

A find and replace JavaScript plugin for webpages.

Either you are giving a editable content or making an editor , find and replace will be very useful feature in your page. findR.js provide find and replace feature with regular expression search for your purpose.

<h3>Features :</h3>

1.  Support multiple instances in a page.
2.	Easy navigate to selection with key events.
3.	Regex search or case ignore search.
4.	Replace and replace all features.
5.	Light weight plug-in.
6.	CSS are defined separately so you can change the style as your need.

<h3>To initialize the plugin on content</h3>
For whole page.
findR(document);
For a content container
findR(id)
Where Id is id of container.

<h3>To initiate</h3>
Find and replace can be bind in any number of containers so. So when user clicks that container it becomes the current container in which find and replace will work. You can also have some button to focus container for find and replace method.
To initiate any control press <strong>ctrl+key</strong>.

There are four control keys. 

1.	<strong>f (ctrl+f)</strong> : To open find and replace toolbar.
2.	<strong>n (ctrl+n)</strong> : To go to next selection (cyclic).
3.  <strong>p (ctrl+p)</strong> : To go to previous selection (cyclic).
4.  <strong>r (ctrl+r)</strong> : To replace the current marked selection with replace text and go to next selection.
