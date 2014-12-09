---
layout:      post
title:       "Easy SSH Key Forwarding"
description: "There are times where you'd like to ship your SSH key onto whatever host you're connecting to... Here is some description to making it painless"
date:        2014-12-03
tags:        Nerd, SSH, Forward-Awesome
---
I've got a need to be able to ship my SSH key from my laptop onto the host that I'm connecting to. This in and of itself is not a monumental task, but it of course can be easy and painless.

### Assumption

I currently work on a Macbook Pro, so these instructions are specific to that machine. However, this is all in the realm of general SSH config and bash profile hackery. Of course, you need to have SSH installed on your machine also, but that should be a given at this point.

### The Skinny

First thing is first, we need to make sure that your SSH Forwarding Agent is turned on. By default, it's turned off, you're going to have to modify your `/etc/ssh_config` to enable it:

<pre class="code">
#   EnableSSHKeysign no
#   EscapeChar ~
#   ExitOnForwardFailure no
   ForwardAgent yes
#   ForwardX11 no
#   ForwardX11Timeout 1200
#   ForwardX11Trusted no
</pre>

Now, we're going to add some helper into your `.profile` (substitute this with .bashrc or whatever get's launched with every terminal on your machine - if you really don't know what you're looking for... whatever exports your $PATH).

Here is the full content of what we're adding, we'll discuss below:

<pre class="code">
# SSH-Agent
agent_test=`/bin/ps -ef | /usr/bin/grep [s]sh-agent | /usr/bin/awk '{print $2}' | xargs`

if [ "$agent_test" = "" ]; then
    # there is no agent running
    if [ -e "$HOME/agent.sh" ]; then
        # remove the old file
        /bin/rm -f $HOME/agent.sh
    fi;
    # start a new agent
    /usr/bin/ssh-agent | /usr/bin/grep -v echo >&$HOME/agent.sh
fi;

test -e $HOME/agent.sh && source $HOME/agent.sh
test -e $HOME/agent.sh && ssh-add ~/.ssh/id_rsa 2>/dev/null

alias kagent="kill -9 $SSH_AGENT_PID"
# SSH-Agent End
</pre>

##### The Test

<pre class="code">
agent_test=`/bin/ps -ef | /usr/bin/grep [s]sh-agent | /usr/bin/awk '{print $2}' | xargs`
</pre>

This is checking to see if the ssh-agent is already running. We do this because we don't want to start an agent with every terminal you open up. This would make problems for already open sessions. We're simply looking at the running processes, grep'ing for ssh-agent (wrapping []'s around the first letter of the pattern will keep the instance of grep out of the results). We'll use the value of $agent_test below to determine if we should start a new agent, or use an existing one.

##### Some Cleanup

<pre class="code">
if [ -e "$HOME/agent.sh" ]; then
    # remove the old file
    /bin/rm -f $HOME/agent.sh
fi;
</pre>

Check to see if there is an existing `agent.sh` in your $HOME directory. The contents of this file come from the step after, but the spoiler, is that ssh-agent spits out some environment variables that you need to export to make the magic happen. We forward the output (from when we actually start the agent) into this file, so that any new terminal can use those variables... re-using the agent and any keys loaded into it. Remember, we're in this block if the $agent_test value is empty, which means that there isn't currently an agent running, we want to clean up any environment variables from a previous agent, they're useless to us right now.

##### Start A New Agent

<pre class="code">
/usr/bin/ssh-agent | /usr/bin/grep -v echo >&$HOME/agent.sh
</pre>

Start a new SSH Agent. The output of the command is forwareded into the previously mentioned `agent.sh` for re-use. The output looks like:

<pre class="code">
# ssh-agent
SSH_AUTH_SOCK=/var/folders/1r/q94mt1gn1cjgpgkbwbdnrfbr0000gp/T//ssh-5zhpoq6QqJQj/agent.79033; export SSH_AUTH_SOCK;
SSH_AGENT_PID=79034; export SSH_AGENT_PID;
echo Agent pid 79034;
</pre>

We grep out the last line, beacuse it's garbage for what we're doing. Now you have your SSH Agent running, with forwarding enabled in the config. The next line is what makes all of this re-usable between terminals:

<pre class="code">
test -e $HOME/agent.sh && source $HOME/agent.sh
</pre>

We check to see if the `agent.sh` file exists, and if it does, we source it. This will re-use the currently running SSH Agent's pid.

##### Adding Keys

The last thing we want to do is add your key to the agent automatically. This will put in your default key always, if you have other keys on your machine, you'll either modify your `.profile` to include those as well, or add them ad hoc as you see fit.

<pre class="code">
test -e $HOME/agent.sh && ssh-add ~/.ssh/id_rsa 2>/dev/null
</pre>

Again, we check for the existence of `agent.sh` before we add the key, no point in doing it if the agent isn't running. We're piping errors to `/dev/null` because the output from `ssh-add` is on STDERR. All it's telling us is that the key was added. 

You can always see what has been added in by running `ssh-add -l` (for list...).

##### Utility

<pre class="code">
alias kagent="kill -9 $SSH_AGENT_PID"
</pre>

All this does is make an easy alias to kill the agent that is running. The `$SSH_AGENT_PID` is available when the agent is started the first time, and subsequently when `agent.sh` is sourced... so it's always available.

### The End

After all this, each time you open up a terminal on your machine, an ssh agent will either be started or resumed and your default key will be added. Any host you connect to will now receive your key and all you did was `cmd-t` (right?).