const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RichMenuData {
  size: {
    width: number;
    height: number;
  };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: Array<{
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    action: {
      type: string;
      uri?: string;
      data?: string;
      text?: string;
      displayText?: string;
      mode?: string;
    };
  }>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    switch (action) {
      case 'create': {
        const richMenuData: RichMenuData = await req.json();
        
        // Create rich menu
        const createResponse = await fetch('https://api.line.me/v2/bot/richmenu', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(richMenuData),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => null);
          return new Response(
            JSON.stringify({ 
              error: errorData?.message || `Failed to create rich menu: ${createResponse.status}` 
            }),
            {
              status: createResponse.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const result = await createResponse.json();
        return new Response(
          JSON.stringify(result),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'upload-image': {
        const richMenuId = url.searchParams.get('richMenuId');
        const imageUrl = url.searchParams.get('imageUrl');
        
        if (!richMenuId || !imageUrl) {
          return new Response(
            JSON.stringify({ error: 'richMenuId and imageUrl parameters are required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Fetch image from URL
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch image from URL' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        const imageBlob = await imageResponse.blob();

        // Upload image to LINE
        const uploadResponse = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': imageBlob.type || 'image/jpeg',
          },
          body: imageBlob,
        });

        if (!uploadResponse.ok) {
          return new Response(
            JSON.stringify({ error: `Failed to upload image: ${uploadResponse.status}` }),
            {
              status: uploadResponse.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'set-default': {
        const richMenuId = url.searchParams.get('richMenuId');
        
        if (!richMenuId) {
          return new Response(
            JSON.stringify({ error: 'richMenuId parameter is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Set as default rich menu
        const setDefaultResponse = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!setDefaultResponse.ok) {
          return new Response(
            JSON.stringify({ error: `Failed to set as default: ${setDefaultResponse.status}` }),
            {
              status: setDefaultResponse.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('Error in LINE API proxy:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});