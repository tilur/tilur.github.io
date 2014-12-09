---
layout:      post
title:       "Man, Do I Dislike Gentoo"
description: Of the \*nix operating systems, Gentoo is the hang-nail of them all.
date:        2014-05-29 14:19:40
tags:        "Geek, OS, Pure Pain, PHP"
---

I've had a little bit of experience with Gentoo in my past, and recent. In the past, I didn't possess the "System Administrator" skills I have now. I put "System Administrator" in quotes, because I wouldn't call myself that to any actual System Administrator. I know enough and have a few tricks up my sleve to fairly quickly get me through my day. I digress... When I was dealing with this *lovely* operating system when I wasn't so long in the tooth, I wasn't doing too much. So I didn't realize how painful it was.

I've been running into an issue with it in the past few days that is making my thoughts boil. I'm trying to migrate an old application, that is using CodeIgniter as it's framework. For anyone in the know, this is a PHP 5.2 problem. Anything above 5.2, you're going to have a bad time. By migrate, I mean moving from one machine to another. I'm not migrating from 5.2 to 5.4.

Package management is generally meant to make your life easier when it comes to dependencies and installing software on a command-line based operating system. The main take-away from this adventure is:

####`emerge` is my bane.

I swear it was close to a half hour to install Apache and PHP together in one fell swoop. The screen looked like a computer does in an episode of CSI: New York when the "hacker" is trying to break into the Gibson. Just FILLED with text scrolling by, varying by only the last 30-ish characters while the four lines above it were identical to the command previously spit out by `make`.

Anyway, I don't have any clever anecdote or Chuck Palahniuk way of bringing the story around from the beginning, I just wanted to share the disdane with (hopefully) you. You're welcome.
