---
layout:      post
title:       "Migrating From SVN to Git"
description: "Switching the ol' version control..."
date:        2014-02-12
tags:        Git, Migration, Nerd, Steps
---

Recently at work, we had to migrate from an SVN repository to Git. The move has been long-coming and ever-anticipated. There are a number of advantages that we would gain from moving to Git, more than what needs to be covered here. But anyone who’s been in these shoes before could probably tell you, it’s not necessarily all puppy dogs and ice cream when it comes to the actual migration.

Taking care of trunk is not that big of a deal. People are not actively working on trunk, as it represents what is currently in production. Like any other development shop, feature branches are cut off of trunk and work is committed there. Migrating trunk to master is simple enough. When you start to think about the active branches, that’s where trickiness ensues.

A tool that is paramount to the success of this migration, happens to be git-svn. We’re a Mac shop, so on your laptop, you can ensure you’ve got the required toolset by using Ports to install Git proper, along with the SVN helpers.

<pre class="code">
port install git-core +svn
</pre>

Before you can do any sort of migration, you’re going to need an authors file, that the import will use to map SVN user commits to email addresses as Git commits. 

<pre class="code">
svn log ^/ --xml | grep &quot;^&lt;author&quot; | sort -u | perl -pe 's/&lt;author&gt;(.*?)<\/author&gt;/$1 = /' &gt; users.txt
</pre>

This will give a text file, called users.txt, with a list of unique usernames who have made commits within your repository. This of course will only work if you’re using a machine that has grep, sort and perl installed. Once you have this file, you’re not done with this yet. You still need to map those usernames to real names/emails of your users so that when the migration happens, the commits in Git will still be relevant and useful. If any users have been missed in this export, who show up during the migration, the git svn command will exit and output to the screen the username attached to the SVN commit that it couldn’t find in the supplied authors file. The contents of the authors file should appear similar to:

<pre class="code">
gregp = Greg Pasternak <gregp@somedomain.net>
ralbon = Reginald Albon <ralbon@somedomain.net>
kevint = Kevin Thompson= <kevint@somedomain.net>
nickm  = Nick Mortson <nickm@somedomain.net>
wilsonj = Wilson Jessard <wilsonj@somedomain.net>
joeb = Joe Buckingham <joeb@somedomain.net>
</pre>

Once you have your authors file, you’re ready to take the first step to cloning your repo. The heavy lifting here is done by the Git SVN helper. You’ll need to specify some flags, that are specific to your situation. Let’s take a look at the command and then break it down.

<pre class="code">
git svn —authors-file=/path/to/users.txt —prefix=svn/ —username=[svn-username] -T relative/to/trunk clone http://svn.url.com/repo /path/to/local/repo
</pre>

<table class="code-definitions">
    <tr>
        <td><code>—authors-file</code></td>
        <td>This is easy enough, this is simply the path to the users.txt file we created from the SVN logs</td>
    </tr>
    <tr>
        <td><code>—prefix</code></td>
        <td>Used to denote the SVN repository in the Git remotes</td>
    </tr>
    <tr>
        <td><code>—username</code></td>
        <td>Your SVN username, to satisfy authentication needs</td>
    </tr>
    <tr>
        <td><code>—T</code></td>
        <td>The path to trunk, which is relative to the URL supplied as the SVN repository</td>
    </tr>
    <tr>
        <td><code>clone</code></td>
        <td>This is the sub-command of git svn that we’re envoking</td>
    </tr>
    <tr>
        <td><code>http://svn.url.com/repo</code></td>
        <td>This is the fully qualified URL to your SVN repository. If you follow the standard layout of SVN repositories, and you’d like to clone everything in trunk, branches and tags, you could probably benefit from the flag —stdlayout.</td>
    </tr>
    <tr>
        <td><code>/path/to/local/repo</code></td>
        <td>Oddly enough, this is the location you want to clone the SVN repo to, locally on the machine you’re working on.</td>
    </tr>
</table>

At this point a bunch of analysis is going to happen and a bunch of checking out is going to follow. This could take very little time, or a lot of time, it really depends on the size of your SVN repository. At the end of it however, you’ll have a local Git repository, with your SVN codebase inside it. The point of our exercise though, is to migrate trunk and a few active branches, not all the branches. So now we have to do a bit of modification.

Use your favourite text editor to make some changes to your .git/config file. After this first heavy-lifting stage, your config should look something like (of course it will be specific to your situation):

<pre class="code">
[core]
     repositoryformatversion = 0
     filemode = true
     bare = false
     logallrefupdates = true
     ignorecase = true
     precomposeunicode = true
[svn-remote "svn"]
     url = http://svn.url.com/repo
     fetch = dev/trunk:refs/remotes/svn/trunk
[svn]
     authorsfile = /path/to/users.txt
</pre>

We now need to add in some definition for the branches that you’d like to migrate as well. We’ll be dealing specifically inside the [svn-remote “svn”] section. You can enumerate through a list of branches, so your life gets a bit easier for this step. Your .git/config should now look like the following:

<pre class="code">
[svn-remote "svn"]
     url = http://svn.url.com/repo
     fetch = dev/trunk:refs/remotes/svn/trunk
     branches = dev/branches/{your-branch-1,another-branch,feature-awesome}/:refs/remotes/*
</pre>

Once you’ve got this configuration saved, we need to fetch all the information about the newly added branches.

<pre class="code">
git svn fetch
</pre>

This command could take some time, depending on your repository and the commit activity that has taken place on the various branches that you are migrating. Of course, the number of branches plays a factor as well. Once this step has completed, you can see the branches, which are all remote branches, by issuing the command:

<pre class="code">
git branch -r
</pre>

Yay! Trunk and branches, in a Git-compliant form. We’re halfway there now, we still want to make the remote branches, proper branches of the newly created local Git repository. We have some bash magic to make this happen:

<pre class="code">
git for-each-ref refs/remotes | cut -d / -f 3- | grep -v @ | while read branchname; do git branch "$branchname" "refs/remotes/$branchname"; git branch -r -d "$branchname"; done
</pre>

Basically, we’re looping through the remotes in the Git repository and massaging the output a bit, so we can create a new local branch based on the remote location. Then we’re deleting the remote branch that is pointed to SVN. What we’re left with after this are local branches, that you can git checkout!

At this point, you should have a local Git repository, that includes master which is a clone of your SVN trunk. Along with that, you should have local branches, that are checkouts from SVN of the active branches you had identified at the beginning of the process. All that is left now, is to add a remote to your Git repository and to push it upstream.

<pre class="code">
git remote add origin git@my-git-server:myrepository.git
git push -u origin —all
</pre>

Guess what, now you’re stoked.
